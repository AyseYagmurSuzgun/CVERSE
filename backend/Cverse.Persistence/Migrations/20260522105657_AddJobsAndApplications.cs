using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Cverse.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJobsAndApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Job",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CompanyName = table.Column<string>(type: "text", nullable: false),
                    CompanyLogoUrl = table.Column<string>(type: "text", nullable: true),
                    Location = table.Column<string>(type: "text", nullable: false),
                    WorkType = table.Column<string>(type: "text", nullable: false),
                    ExperienceLevel = table.Column<string>(type: "text", nullable: false),
                    SalaryRange = table.Column<string>(type: "text", nullable: true),
                    RequiredSkills = table.Column<List<string>>(type: "text[]", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Job", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JobApplication",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppliedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobApplication", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobApplication_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobApplication_Job_JobId",
                        column: x => x.JobId,
                        principalTable: "Job",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Job",
                columns: new[] { "Id", "CompanyLogoUrl", "CompanyName", "CreatedAt", "Description", "ExperienceLevel", "Location", "RequiredSkills", "SalaryRange", "Title", "WorkType" },
                values: new object[,]
                {
                    { new Guid("1a580a15-090c-43f3-9d0d-9b5d4f3b7b2a"), "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop", "Vespera Tech", new DateTime(2026, 5, 22, 12, 0, 0, 0, DateTimeKind.Utc), "Looking for a seasoned React Developer to build premium, high-performance, glassmorphic Web UIs. You will be responsible for creating fluid user experiences, styling with high-performance CSS/Tailwind, and integrating with RESTful and WebSockets APIs.", "Senior", "İstanbul, TR (Hybrid)", new List<string> { "React", "JavaScript", "TypeScript", "CSS", "Tailwind CSS", "Redux" }, "80,000 - 110,000 TRY", "Senior React Developer", "Hybrid" },
                    { new Guid("2b691b26-1a1d-44e4-ae1e-ac6e5e4c8c3b"), "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop", "Cverse Solutions", new DateTime(2026, 5, 21, 12, 0, 0, 0, DateTimeKind.Utc), "We are seeking a Lead Backend Architect with deep knowledge in ASP.NET Core, EF Core, and PostgreSQL. You will design additive, scalable, microservice-ready backend APIs, configure PostgreSQL constraints, implement Real-time SignalR notifications, and secure authentication flows.", "Lead", "Ankara, TR (On-Site)", new List<string> { ".NET Core", "ASP.NET Core", "C#", "Entity Framework Core", "PostgreSQL", "SignalR", "RESTful API" }, "95,000 - 130,000 TRY", "Lead .NET Core Architect", "On-Site" },
                    { new Guid("3c702c37-2b2e-45f5-bf2f-bd7f6f5d9d4c"), "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=100&h=100&fit=crop", "Nebula Cloud Solutions", new DateTime(2026, 5, 20, 12, 0, 0, 0, DateTimeKind.Utc), "Join us to manage our automated CI/CD pipelines, Dockerized deployments, and cloud infrastructure. You will work extensively with Docker, Kubernetes, GitHub Actions, AWS, and Linux environments to guarantee zero-downtime deployments.", "Senior", "Remote, TR", new List<string> { "Docker", "Kubernetes", "AWS", "CI/CD", "GitHub Actions", "Linux", "Terraform" }, "90,000 - 120,000 TRY", "Senior DevOps & Cloud Engineer", "Remote" },
                    { new Guid("4d813d48-3c3f-46f6-c03f-ce8f7f6e0e5d"), "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop", "Innovate Labs", new DateTime(2026, 5, 19, 12, 0, 0, 0, DateTimeKind.Utc), "Excellent opportunity for an aspiring C# developer to grow under senior mentorship. You will help build and maintain backend REST APIs using C# and ASP.NET Core, write database queries with EF Core, and implement modular features using additive architecture.", "Junior", "İzmir, TR (Hybrid)", new List<string> { "C#", ".NET Core", "ASP.NET Core", "Entity Framework Core", "PostgreSQL", "Git" }, "40,000 - 55,000 TRY", "Junior Backend Developer (C#)", "Hybrid" },
                    { new Guid("5e924e59-4d4f-47f7-d14f-df9f8f7f1f6e"), "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&h=100&fit=crop", "Apex Intelligence", new DateTime(2026, 5, 18, 12, 0, 0, 0, DateTimeKind.Utc), "Seeking a Data Analyst to develop AI matching algorithms, analyze CV text extraction outputs, and build Python scripts for statistical modeling. You will work with pandas, NumPy, scikit-learn, and REST integrations with .NET Core services.", "Mid", "Remote, Global", new List<string> { "Python", "pandas", "NumPy", "scikit-learn", "SQL", "Machine Learning", "Data Analysis" }, "70,000 - 90,000 TRY", "Data & Python Systems Analyst", "Remote" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobApplication_JobId",
                table: "JobApplication",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_JobApplication_UserId_JobId",
                table: "JobApplication",
                columns: new[] { "UserId", "JobId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JobApplication");

            migrationBuilder.DropTable(
                name: "Job");
        }
    }
}
