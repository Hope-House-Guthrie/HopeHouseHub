{
  lib,
  pkgs,
  imagePackage,
  imageConfiguration,
  ...
}:

let
  archiveName = "${imageConfiguration.image.baseName}.vma.zst";
  imagePackageName = lib.removePrefix "/nix/store/" imagePackage;
  imageName = "disk-drive-virtio0.raw";

  localArchivePath = "${imagePackage}/${archiveName}";
  remoteArchivePath = "/tmp/${imagePackageName}.${archiveName}";
  importImageName = "${imagePackageName}.${imageName}";
in
{
  terraform = {
    required_providers = {
      proxmox = {
        source = "bpg/proxmox";
        version = "~> 0.111";
      };
    };
  };

  variable.pve_host = {
    type = "string";
    default = "192.168.0.3";
    description = "Proxmox IP address or hostname";
  };

  variable.pve_root_passwd = {
    type = "string";
    sensitive = true;
    description = "Password for Proxmox root user";
  };

  variable.node_name = {
    type = "string";
    default = "pve01";
    description = "Proxmox target node name";
  };

  variable.vm_name = {
    type = "string";
    default = "hub-services";
    description = "Virtual machine name";
  };

  provider.proxmox = {
    endpoint = "https://\${var.pve_host}:8006";
    username = "root@pam";
    password = "\${var.pve_root_passwd}";
    insecure = true;
  };

  resource.terraform_data.import_image = {
    triggers_replace = {
      local_archive_path = localArchivePath;
      remote_archive_path = remoteArchivePath;
      image_name = imageName;
      import_image_name = importImageName;
      pve_host = "\${var.pve_host}";
      pve_root_passwd = "\${var.pve_root_passwd}";
    };

    provisioner = [
      {
        "local-exec" = {
          when = "create";
          command = ''
            set -e

            TMP_ARCHIVE="${remoteArchivePath}"

            SSHPASS=''${var.pve_root_passwd} \
              ${pkgs.sshpass}/bin/sshpass -e \
              ${pkgs.openssh}/bin/scp "${localArchivePath}" "root@''${var.pve_host}:$TMP_ARCHIVE"

            SSHPASS=''${var.pve_root_passwd} \
              ${pkgs.sshpass}/bin/sshpass -e \
              ${pkgs.openssh}/bin/ssh "root@''${var.pve_host}" "
                set -e
                TMP_DIR=\$(mktemp -d)
                zstd -dc $TMP_ARCHIVE | vma extract - \$TMP_DIR/extract
                mv \$TMP_DIR/extract/${imageName} /var/lib/vz/import/${importImageName}
                rm -rf \$TMP_DIR
                rm -f $TMP_ARCHIVE
              "
          '';
        };
      }
      {
        "local-exec" = {
          when = "destroy";
          command = ''
            SSHPASS=''${self.triggers_replace.pve_root_passwd} \
              ${pkgs.sshpass}/bin/sshpass -e \
              ${pkgs.openssh}/bin/ssh "root@''${self.triggers_replace.pve_host}" "rm -f /var/lib/vz/import/''${self.triggers_replace.import_image_name}"
          '';
        };
      }
    ];

    input = importImageName;
  };

  resource.proxmox_virtual_environment_vm.hub-services = {
    name = "\${var.vm_name}";
    node_name = "\${var.node_name}";
    vm_id = 201;
    bios = "ovmf";
    machine = "q35";

    agent = {
      enabled = true;
    };

    cpu = {
      cores = 4;
      type = "host";
    };

    memory = {
      dedicated = 8096;
    };

    network_device = [
      {
        enabled = true;
        bridge = "vmbr0";
        disconnected = false;
        firewall = false;
        mac_address = "BC:24:11:A7:C8:28";
        model = "virtio";
        mtu = 0;
        queues = 0;
        rate_limit = 0;
        trunks = "";
        vlan_id = 0;
      }
    ];

    efi_disk = {
      datastore_id = "local-lvm";
      type = "4m";
      pre_enrolled_keys = false;
      file_format = "raw";
    };

    tpm_state = {
      datastore_id = "local-lvm";
      version = "v2.0";
    };

    disk = [
      {
        datastore_id = "local-lvm";
        interface = "virtio0";
        size = 32;
        import_from = "local:import/\${resource.terraform_data.import_image.output}";
      }
    ];

    operating_system = {
      type = "l26";
    };

    serial_device = [ { } ];
  };

  output.vm_id = {
    value = "\${proxmox_virtual_environment_vm.hub-services.vm_id}";
    description = "Proxmox VM ID";
  };
}
