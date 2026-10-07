namespace H3.Data.Enums;

public enum SystemRole
{
    [SystemRole("Admin Staff", "ADMIN")]
    Admin = 1,

    [SystemRole("Client", "CLIENT")]
    Client = 2,

    [SystemRole("Kitchen Staff", "KITCHEN")]
    Kitchen = 3,

    [SystemRole("House Leader", "LEADER")]
    Leader = 4,

    [SystemRole("Board Member", "BOARD")]
    Board = 5,

    [SystemRole("Prototype", "PROTOTYPE")]
    Prototype = 6,

    [SystemRole("Preview", "PREVIEW")]
    Preview = 7,
}