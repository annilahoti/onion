using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SeleniumExtras.WaitHelpers;


namespace PMS.SeleniumTests
{
    [TestFixture, Order(4)]
    public class ListTests : BaseTest
    {
        private WebDriverWait wait;
        private const string PreviewUrl  = "http://localhost:3000/main/preview";
        private const string WorkspaceUrl = "http://localhost:3000/main/workspace";
        private const string DashboardUrl = "http://localhost:3000/dashboard/users";

        [SetUp]
        public void TestSetup()
        {
            wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(20));
        }

        [Test, Order(1)]
        public void CreateList_EmptyCredentials_ShowListError()
        {
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
            Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();
            wait.Until(d => d.Url.Contains("/main/workspace"));

            Driver.Navigate().GoToUrl(WorkspaceUrl);
            // Prit deri sa butoni të jetë në DOM dhe i klikueshëm
            var newListButton = wait.Until(driver => driver.FindElement(By.CssSelector("[data-testid='new-list-btn']")));
            newListButton.Click();

            var createListButton = wait.Until(driver => driver.FindElement(By.CssSelector("[data-testid='create-list']")));
            createListButton.Click();

            bool isErrorShown = wait.Until( d =>
                d.FindElement(By.CssSelector(".swal2-html-container"))
                .Text.Contains("List title cannot be empty.")
            );
            Assert.That(isErrorShown, Is.True, "Expected list-name-required error did not appear.");
        }

        [Test, Order(2)]
        public void CreateList_ValidCredentials()
        {
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
            Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();
            wait.Until(d => d.Url.Contains("/main/workspace"));

            Driver.Navigate().GoToUrl(WorkspaceUrl);

            var newListButton = wait.Until(driver => driver.FindElement(By.CssSelector("[data-testid='new-list-btn']")));
            newListButton.Click();
 
            var uniqueListName = $"Lista {DateTime.Now}";
            Driver.FindElement(By.Name("list-name")).SendKeys(uniqueListName);
            
            var createListButton = wait.Until(driver => driver.FindElement(By.CssSelector("[data-testid='create-list']")));
            createListButton.Click();

            var createdList = wait.Until(d =>
                d.FindElements(By.CssSelector("[data-testid='list-title']"))
                .Any(el => el.Text.Contains(uniqueListName))
            );

            Assert.That(createdList, Is.True, "List has been created successfully");

        }

        [Test, Order(3)]
        public void EditList_TitleSuccessfullyUpdated()
        {
            // Login
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
            Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();
            wait.Until(d => d.Url.Contains("/main/workspace"));

            // Navigate to workspace
            Driver.Navigate().GoToUrl(WorkspaceUrl);

            // Wait for list titles to be visible
            wait.Until(d => d.FindElements(By.CssSelector("[data-testid='list-title']")).Count > 0);

            var listTitles = Driver.FindElements(By.CssSelector("[data-testid='list-title']"));
            IWebElement targetTitle = listTitles.FirstOrDefault(t => !string.IsNullOrWhiteSpace(t.Text));

            Assert.That(targetTitle, Is.Not.Null, "No list title found to edit.");

            // Click to enable edit mode
            targetTitle.Click();

            // Wait for the input field to appear
            wait.Until(d => d.FindElement(By.CssSelector("[data-testid='editing-title']")));

            var input = Driver.FindElement(By.CssSelector("[data-testid='editing-title']"));
            input.Clear();
            var newTitle = $"Titulli i ndryshuar {DateTime.Now:HHmmss}";
            input.SendKeys(newTitle);

            // Click save
            Driver.FindElement(By.CssSelector("[data-testid='edit-save-btn']")).Click();

            // Wait for input to disappear (DOM refresh complete)
            wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.InvisibilityOfElementLocated(
                By.CssSelector("[data-testid='editing-title']")
            ));

            // Now wait until the new title appears in list
            wait.Until(d =>
            {
                var updatedTitles = d.FindElements(By.CssSelector("[data-testid='list-title']"));
                return updatedTitles.Any(e => e.Text.Trim().Contains(newTitle.Trim()));
            });


            // Assert title is updated
            var finalTitle = Driver.FindElements(By.CssSelector("[data-testid='list-title']"))
                .FirstOrDefault(e => e.Text.Trim() == newTitle);
            Assert.That(finalTitle, Is.Not.Null, "Updated list title was not found.");
        }


        [Test, Order(4)]
        public void DeleteList_ShouldDeleteListSuccessfully()
        {
            // Login
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
            Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();
            wait.Until(d => d.Url.Contains("/main/workspace"));

            wait.Until(d => d.FindElements(By.CssSelector("[data-testid='delete-list-btn']")).Count > 0);
            int initialListCount = Driver.FindElements(By.CssSelector("[data-testid='delete-list-btn']")).Count;

            var listToDelete = wait.Until(d => d.FindElements(By.CssSelector("[data-testid='delete-list-btn']"))).First();
            listToDelete.Click();

            wait.Until(d => d.FindElement(By.CssSelector(".swal2-confirm")));
            var confirmDeleteBtn = Driver.FindElement(By.CssSelector(".swal2-confirm"));
            Assert.That(confirmDeleteBtn.Text.Trim(), Is.EqualTo("Yes, delete it!"));
            confirmDeleteBtn.Click();


            // Prit derisa të shfaqet popup-i i suksesit që përmban tekstin "Deleted!"
            wait.Until(d =>
            {
                var popups = d.FindElements(By.CssSelector(".swal2-popup"));
                return popups.Any(p => p.Text.Contains("Deleted!"));
            });

            var successPopup = Driver.FindElements(By.CssSelector(".swal2-popup"))
                                    .First(p => p.Text.Contains("Deleted!"));
            Assert.That(successPopup.Text, Does.Contain("Deleted!"));



            var okButton = Driver.FindElement(By.CssSelector(".swal2-confirm"));
            okButton.Click();

            wait.Until(d =>
            {
                var remainingLists = d.FindElements(By.CssSelector("[data-testid='delete-list-btn']"));
                return remainingLists.Count < initialListCount;
            });

            var finalListCount = Driver.FindElements(By.CssSelector("[data-testid='delete-list-btn']")).Count;
            Assert.That(finalListCount, Is.LessThan(initialListCount), "List was not deleted successfully.");
        }






    }
}