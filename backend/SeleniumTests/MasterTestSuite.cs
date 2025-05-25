using NUnit.Framework;
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace PMS.SeleniumTests
{
    [SetUpFixture]
    public class MasterTestSuite
    {
        private readonly string BaseUrl = "http://localhost:3000";

        [OneTimeSetUp]
        public void GlobalSetup()
        {
            Console.WriteLine("Starting all tests...");
            // Seed Admin and regular users via backend API
            using var client = new HttpClient { BaseAddress = new Uri(BaseUrl) };
            var users = new[]
            {
                new { firstName = "Endrit", lastName = "Musaj", email = "endrit@musaj.com", password = "Endrit123456!" },
                new { firstName = "Test",   lastName = "User",   email = "testuser@test.com", password = "ValidP@ssw0rd" }
            };
            foreach (var u in users)
            {
                try
                {
                    var payload = new
                    {
                        firstName = u.firstName,
                        lastName = u.lastName,
                        email = u.email,
                        password = u.password
                    };
                    var json = JsonSerializer.Serialize(payload);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    var response = client.PostAsync("/backend/user/register", content).Result;
                    Console.WriteLine($"Seeded user {u.email}: {(int)response.StatusCode}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed seeding {u.email}: {ex.Message}");
                }
            }
        }

        [OneTimeTearDown]
        public void GlobalTeardown()
        {
            Console.WriteLine("Finished all tests.");
        }
    }

    [TestFixture, Order(1)]
    public class AdminLoginTests : BaseTest
    {
        private WebDriverWait wait;
        private const string PreviewUrl = "http://localhost:3000/preview";

        [SetUp]
        public void SetupLogin()
        {
            wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(10));
        }

        [Test]
        public void AdminLogin_ValidCredentials_ShouldRedirectToWorkspace()
        {
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
            Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();
            wait.Until(d => d.Url.Contains("/main/workspace"));
            Assert.That(Driver.Url, Does.Contain("/main/workspace"));
        }
    }

    [TestFixture, Order(2)]
    public class AdminDashboardTests : BaseTest
    {
        private WebDriverWait wait;
        private const string PreviewUrl = "http://localhost:3000/preview";
        private const string UsersPageUrl = "http://localhost:3000/dashboard/users";

        [SetUp]
        public void SetupDashboard()
        {
            wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(10));
            // Login as Admin
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
            Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();
            wait.Until(d => d.Url.Contains("/main/workspace"));
        }
    }
}
