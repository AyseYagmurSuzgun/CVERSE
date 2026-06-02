using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cverse.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCvAnalysisTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CvAnalysis",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    OriginalFileName = table.Column<string>(type: "text", nullable: false),
                    UploadedPdfUrl = table.Column<string>(type: "text", nullable: false),
                    ParsedText = table.Column<string>(type: "text", nullable: false),
                    AtsScore = table.Column<int>(type: "integer", nullable: false),
                    ScoreTechnical = table.Column<int>(type: "integer", nullable: false),
                    ScoreExperience = table.Column<int>(type: "integer", nullable: false),
                    ScoreFormatting = table.Column<int>(type: "integer", nullable: false),
                    ScoreImpact = table.Column<int>(type: "integer", nullable: false),
                    ExperienceLevel = table.Column<string>(type: "text", nullable: false),
                    TechnicalSkills = table.Column<List<string>>(type: "text[]", nullable: false),
                    MissingSkills = table.Column<List<string>>(type: "text[]", nullable: false),
                    Strengths = table.Column<List<string>>(type: "text[]", nullable: false),
                    Weaknesses = table.Column<List<string>>(type: "text[]", nullable: false),
                    JobSuggestions = table.Column<List<string>>(type: "text[]", nullable: false),
                    ImprovementSuggestions = table.Column<List<string>>(type: "text[]", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CvAnalysis", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CvAnalysis_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CvAnalysis_UserId",
                table: "CvAnalysis",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CvAnalysis");
        }
    }
}
