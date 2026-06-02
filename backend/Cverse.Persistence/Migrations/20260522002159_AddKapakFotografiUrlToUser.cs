using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cverse.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddKapakFotografiUrlToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "KapakFotografiUrl",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KapakFotografiUrl",
                table: "AspNetUsers");
        }
    }
}
