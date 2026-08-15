{
  imagePackage,
  imageConfiguration,
  ...
}:

let
  vhdPath = "${imagePackage}/${imageConfiguration.image.fileName}";
  vhdSizeBytes = (imageConfiguration.virtualisation.diskSize * 1024 * 1024) + 512;
in
{
  terraform = {
    required_version = ">= 1.5.0";
    required_providers = {
      azurerm = {
        source = "hashicorp/azurerm";
        version = "~> 4.0";
      };
      null = {
        source = "hashicorp/null";
        version = "~> 3.3";
      };
    };
  };

  variable.resource_group_name = {
    type = "string";
    default = "hub";
    description = "Name of the Azure Resource Group";
  };

  variable.location = {
    type = "string";
    default = "southcentralus";
    description = "Azure region location";
  };

  variable.vm_name = {
    type = "string";
    default = "hub-gateway";
    description = "Base name for the Virtual Machine and associated network resources";
  };

  variable.gallery_name = {
    type = "string";
    default = "hub";
    description = "Name of the Shared Image Gallery";
  };

  provider.azurerm = {
    features = { };
  };

  resource.azurerm_resource_group.rg = {
    name = "\${var.resource_group_name}";
    location = "\${var.location}";
  };

  resource.azurerm_virtual_network.vnet = {
    resource_group_name = "\${azurerm_resource_group.rg.name}";
    location = "\${azurerm_resource_group.rg.location}";

    name = "\${var.vm_name}-vnet";
    address_space = [ "10.0.0.0/16" ];
  };

  resource.azurerm_subnet.subnet = {
    resource_group_name = "\${azurerm_resource_group.rg.name}";

    name = "default";
    virtual_network_name = "\${azurerm_virtual_network.vnet.name}";
    address_prefixes = [ "10.0.1.0/24" ];
  };

  resource.azurerm_public_ip.pip = {
    resource_group_name = "\${azurerm_resource_group.rg.name}";
    location = "\${azurerm_resource_group.rg.location}";

    name = "\${var.vm_name}-pip";
    allocation_method = "Static";
    sku = "Standard";
  };

  resource.azurerm_network_interface.nic = {
    resource_group_name = "\${azurerm_resource_group.rg.name}";
    location = "\${azurerm_resource_group.rg.location}";

    name = "\${var.vm_name}-nic";

    ip_configuration = {
      name = "internal";
      subnet_id = "\${azurerm_subnet.subnet.id}";
      private_ip_address_allocation = "Dynamic";
      public_ip_address_id = "\${azurerm_public_ip.pip.id}";
    };

    accelerated_networking_enabled = true;
  };

  resource.azurerm_managed_disk.os_disk = {
    resource_group_name = "\${azurerm_resource_group.rg.name}";
    location = "\${azurerm_resource_group.rg.location}";

    name = "\${var.vm_name}-osdisk";
    storage_account_type = "StandardSSD_LRS";
    create_option = "Upload";
    upload_size_bytes = vhdSizeBytes;
    hyper_v_generation = "V2";
    os_type = "Linux";
  };

  resource.null_resource.upload_vhd = {
    triggers = {
      disk_id = "\${azurerm_managed_disk.os_disk.id}";
    };

    provisioner = [
      {
        local-exec = {
          command = ''
            set -e

            az disk update \
              --resource-group "''${azurerm_resource_group.rg.name}" \
              --name "''${azurerm_managed_disk.os_disk.name}" \
              --set supportedCapabilities.diskControllerTypes="SCSI, NVMe"

            SAS_URL=$(az disk grant-access \
              --resource-group "''${azurerm_resource_group.rg.name}" \
              --name "''${azurerm_managed_disk.os_disk.name}" \
              --access-level Write \
              --duration-in-seconds 14400 \
              --query accessSAS -o tsv)

            export AZCOPY_CONCURRENCY_VALUE=4

            azcopy copy "${vhdPath}" "$SAS_URL" \
              --blob-type PageBlob \
              --block-size-mb 8 \
              --check-length=false

            az disk revoke-access \
              --resource-group "''${azurerm_resource_group.rg.name}" \
              --name "''${azurerm_managed_disk.os_disk.name}"
          '';
        };
      }
    ];

    depends_on = [ "azurerm_managed_disk.os_disk" ];
  };

  resource.azurerm_shared_image_gallery.gallery = {
    resource_group_name = "\${azurerm_resource_group.rg.name}";
    location = "\${azurerm_resource_group.rg.location}";

    name = "\${var.gallery_name}";
  };

  resource.azurerm_shared_image.image_def = {
    resource_group_name = "\${azurerm_resource_group.rg.name}";
    location = "\${azurerm_resource_group.rg.location}";
    gallery_name = "\${azurerm_shared_image_gallery.gallery.name}";

    name = "\${var.vm_name}-def";
    os_type = "Linux";
    hyper_v_generation = "V2";
    architecture = "x64";

    identifier = {
      publisher = "Custom";
      offer = "NixOS";
      sku = "standard";
    };

    disk_controller_type_nvme_enabled = true;
  };

  resource.azurerm_shared_image_version.image_version = {
    resource_group_name = "\${azurerm_resource_group.rg.name}";
    location = "\${azurerm_resource_group.rg.location}";
    gallery_name = "\${azurerm_shared_image_gallery.gallery.name}";

    name = "1.0.0";
    image_name = "\${azurerm_shared_image.image_def.name}";
    os_disk_snapshot_id = "\${azurerm_managed_disk.os_disk.id}";

    target_region = [
      {
        name = "\${azurerm_resource_group.rg.location}";
        regional_replica_count = 1;
      }
    ];

    depends_on = [ "null_resource.upload_vhd" ];
  };

  resource.azurerm_linux_virtual_machine.vm = {
    resource_group_name = "\${azurerm_resource_group.rg.name}";
    location = "\${azurerm_resource_group.rg.location}";

    name = "\${var.vm_name}";
    size = "Standard_D2als_v7";
    admin_username = "nixos";
    network_interface_ids = [ "\${azurerm_network_interface.nic.id}" ];

    admin_ssh_key = [
      {
        username = "nixos";
        public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDz0k+LBhgEqM9Sr+sIAeP6jIYKIiKVHmIcv2pkYxM3jXYNgAtkhCXe9Vo8Q8kt9guG6+M3haUFfj/KS6PhXgkONdh5EP9sXnacWyy2Z2U3fHAUBNSKFBVesz5Bol2p8RfEPlw4Tq7zfXZP9jO3sx3t2tDsEPx5P8N3sREKphpbebKzHZFKE9Ayafn0aREXdFwO3eEdzgd4IGHXLM9/OH9ZzXtEQbv60Rjv/P/kpMZZj+1HZVJIUa/gjHqJMLiZWPdtjRB7Kw84t1Nxv8cQJmN5erNJuCQxPqgN7frrp9DmX1nOFxftrXt6xesXBQpTB5C8anzDfE90umd66q6Xf4qGCeiA56A2ycmH3udD9uChKJcxRA5WK3IDLI3FCtJhYKbJOaRfqfnYzNpF6MTRXtFDOdYxTrEkZir2TnzdavpSvT7rP9eVK+ObWJo381XOMTW1rUNtynJxgQf9G3JyJUQLCjUO8nPfg8/BHMBYzV7K3f1wtxLthBbqOB/f6y/FFdk= dummy@nixos";
      }
    ];

    disable_password_authentication = true;

    os_disk = {
      caching = "ReadWrite";
      storage_account_type = "StandardSSD_LRS";
      disk_size_gb = 32;
    };

    source_image_id = "\${azurerm_shared_image_version.image_version.id}";
  };

  output.public_ip = {
    value = "\${azurerm_public_ip.pip.ip_address}";
    description = "Public IP of the booted NixOS instance";
  };
}
