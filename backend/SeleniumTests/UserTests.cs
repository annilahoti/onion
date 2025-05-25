using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Linq;

namespace PMS.SeleniumTests
{
    [TestFixture, Order(3)]
    public class UserTests : BaseTest
    {
        private WebDriverWait wait;
        private const string PreviewUrl = "http://localhost:3000/preview";
        private const string DashboardUrl = "http://localhost:3000/dashboard/users";

        [SetUp]
        public void TestSetup()
        {
            wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(10));
        }

        [Test, Order(1)]
        public void Login_EmptyCredentials_ShowsEmailError()
        {
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();

            bool isErrorShown = wait.Until(d =>
                d.FindElement(By.CssSelector(".text-red-600"))
                 .Text.Contains("Please enter your email.")
            );
            Assert.That(isErrorShown, Is.True, "Expected email-required error did not appear.");
        }

        [Test, Order(2)]
        public void Login_ValidCredentials_RedirectsToWorkspace()
        {
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
            Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();

            wait.Until(d => d.Url.Contains("/main/workspace"));
            Assert.That(Driver.Url.Contains("/main/workspace"), Is.True, "Did not navigate to workspace.");
        }

        [Test, Order(3)]
        public void Signup_InvalidInput_ShowsFirstNameError()
        {
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.XPath("//button[text()='Sign Up']")).Click();
            Driver.FindElement(By.CssSelector("[data-testid='signup-btn']")).Click();

            bool isErrorShown = wait.Until(d =>
                d.FindElement(By.CssSelector(".text-red-600"))
                 .Text.Contains("Please enter a valid first name.")
            );
            Assert.That(isErrorShown, Is.True, "Expected first-name validation error did not appear.");
        }

        [Test, Order(4)]
        public void Signup_ValidInput_RedirectsToWorkspace()
        {
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.XPath("//button[text()='Sign Up']")).Click();

            Driver.FindElement(By.Name("firstName")).SendKeys("John");
            Driver.FindElement(By.Name("lastName")).SendKeys("Doe");
            var uniqueEmail = $"john{DateTime.Now.Ticks}@test.com";
            Driver.FindElement(By.Name("email")).SendKeys(uniqueEmail);
            Driver.FindElement(By.Name("password")).SendKeys("StrongP@ss1");
            Driver.FindElement(By.Name("confirmPassword")).SendKeys("StrongP@ss1");

            Driver.FindElement(By.CssSelector("[data-testid='signup-btn']")).Click();

            var popup = wait.Until(d => d.FindElement(By.CssSelector(".swal2-popup")));
            popup.FindElement(By.CssSelector(".swal2-confirm")).Click();

            wait.Until(d => d.Url.Contains("/main/workspace"));
            Assert.That(Driver.Url.Contains("/main/workspace"),
                        Is.True,
                        "Did not navigate to workspace after signup.");
        }

        [Test, Order(5)]
        public void DeleteUser_TogglesIsDeletedInUsersTable()
        {
            // Login as admin
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
            Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();
            wait.Until(d => d.Url.Contains("/main/workspace"));

            // Navigate to users page and wait for rows
            Driver.Navigate().GoToUrl(DashboardUrl);
            wait.Until(d => d.FindElements(By.CssSelector("table tbody tr")).Count > 0);

          
            var initial = Driver
                .FindElement(By.CssSelector("table tbody tr:nth-child(1) td:nth-child(7)"))
                .Text.Trim();

            //  Click the “Delete” button in the first row
            Driver
              .FindElement(By.XPath("//table/tbody/tr[1]//button[normalize-space()='Delete']"))
              .Click();

            wait.Until(d =>
            {
               
                var current = d
                    .FindElement(By.CssSelector("table tbody tr:nth-child(1) td:nth-child(7)"))
                    .Text.Trim();
                return current != initial;
            });

            var updated = Driver
                .FindElement(By.CssSelector("table tbody tr:nth-child(1) td:nth-child(7)"))
                .Text.Trim();
            Assert.That(updated, Is.Not.EqualTo(initial),
                        "User deletion flag did not toggle.");
        }



            [Test, Order(6)]
            public void EditUserInfo_ValidInput_ReflectsInTable()
            {
                // Login as admin
                Driver.Navigate().GoToUrl(PreviewUrl);
                Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
                Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
                Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();
                wait.Until(d => d.Url.Contains("/main/workspace"));

                // Navigate to users page and wait for rows
                Driver.Navigate().GoToUrl(DashboardUrl);
                wait.Until(d => d.FindElements(By.CssSelector("table tbody tr")).Count > 0);

                // Find the first row where Is Deleted column is false
                var rows = Driver.FindElements(By.CssSelector("table tbody tr"));
                IWebElement editableRow = null;
                foreach (var row in rows)
                {
                    var isDeletedText = row
                        .FindElement(By.CssSelector("td:nth-child(7)"))
                        .Text.Trim()
                        .ToLower();
                    if (isDeletedText == "false")
                    {
                        editableRow = row;
                        break;
                    }
                }
                Assert.That(editableRow, Is.Not.Null, "No non-deleted user found to edit.");

                // Click Edit on that row
                editableRow
                    .FindElement(By.XPath(".//button[normalize-space()='Edit']"))
                    .Click();

                // Wait for UpdateUserModal
                wait.Until(d => d.FindElement(By.CssSelector("div.fixed.z-50")));

                // Click Edit User Info
                Driver.FindElement(By.XPath("//button[normalize-space()='Edit User Info']")).Click();

                // Wait for EditInfoModal (input#email)
                wait.Until(d => d.FindElement(By.Id("email")));

                // Enter new values
                var emailInput     = Driver.FindElement(By.Id("email"));
                var firstNameInput = Driver.FindElement(By.Id("firstName"));
                var lastNameInput  = Driver.FindElement(By.Id("lastName"));

                var newEmail     = $"updated{DateTime.Now.Ticks}@test.com";
                var newFirstName = "EditedFirst";
                var newLastName  = "EditedLast";

                emailInput.Clear();      emailInput.SendKeys(newEmail);
                firstNameInput.Clear();  firstNameInput.SendKeys(newFirstName);
                lastNameInput.Clear();   lastNameInput.SendKeys(newLastName);

                // Submit changes
                Driver.FindElement(By.XPath("//button[normalize-space()='Update']")).Click();

                // Handle SweetAlert confirmation
                var popup = wait.Until(d => d.FindElement(By.CssSelector(".swal2-popup")));
                popup.FindElement(By.CssSelector(".swal2-confirm")).Click();

                //  Wait for modal to close
                wait.Until(d => d.FindElements(By.Id("email")).Count == 0);

    
                Driver.Navigate().Refresh();
                wait.Until(d => d.FindElements(By.CssSelector("table tbody tr")).Count > 0);

            
                var updatedRow = Driver.FindElements(By.CssSelector("table tbody tr"))
                                    .First(r => r.FindElement(By.CssSelector("td:nth-child(3)")).Text.Trim() == newEmail);

                Assert.Multiple(() =>
                {
                    Assert.That(
                        updatedRow.FindElement(By.CssSelector("td:nth-child(1)")).Text.Trim(),
                        Is.EqualTo(newFirstName), "First name not updated in table."
                    );
                    Assert.That(
                        updatedRow.FindElement(By.CssSelector("td:nth-child(2)")).Text.Trim(),
                        Is.EqualTo(newLastName), "Last name not updated in table."
                    );
                    Assert.That(
                        updatedRow.FindElement(By.CssSelector("td:nth-child(3)")).Text.Trim(),
                        Is.EqualTo(newEmail), "Email not updated in table."
                    );
                });
            }


    }
}
