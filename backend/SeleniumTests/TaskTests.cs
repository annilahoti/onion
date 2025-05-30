using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.WaitHelpers;

namespace PMS.SeleniumTests;
[TestFixture, Order(5)]
public class TaskTests : BaseTest
{
    private WebDriverWait wait;
        private const string PreviewUrl = "http://localhost:3000/main/preview";
        private const string WorkspaceUrl = "http://localhost:3000/main/workspace";
        private string testListName = $"Test List {DateTime.Now:HHmmss}";

        [SetUp]
        public void TestSetup()
        {
            wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(20));
            LoginAndCreateTestList();
        }

        [TearDown]
        public void TestCleanup()
        {
            DeleteTestList();
        }

        [Test, Order(1)]
        public void CreateTask_EmptyTitle_ShouldShowError()
        {
            // Navigate to the first available list
            var firstList = wait.Until(d => 
                d.FindElements(By.CssSelector("[data-testid='list-title']")).First());
            firstList.Click();

            //  Click the "Add a task" button
            var addTaskBtn = wait.Until(d => 
                d.FindElement(By.CssSelector("[data-testid='add-task-btn']")));
            addTaskBtn.Click();

            // Verify the task form is visible
            wait.Until(d => d.FindElement(By.CssSelector("[data-testid='task-title-input']")).Displayed);

            // Click submit without entering any text
            var submitBtn = wait.Until(d => 
                d.FindElement(By.CssSelector("[data-testid='submit-task-btn']")));
            submitBtn.Click();

            // Verify error message appears
            bool isErrorShown = wait.Until(d =>
            {
                try 
                {
                    var errorPopup = d.FindElement(By.CssSelector(".swal2-popup"));
                    return errorPopup.Displayed && 
                           errorPopup.Text.Contains("Task title cannot be empty.");
                }
                catch
                {
                    return false;
                }
            });
    
            Assert.That(isErrorShown, Is.True, "Expected empty task title error did not appear.");

            // Close the error popup
            var confirmBtn = wait.Until(d => d.FindElement(By.CssSelector(".swal2-confirm")));
            confirmBtn.Click();

            // Verify the task form is still open (failed submission shouldn't close form)
            var taskInput = wait.Until(d => d.FindElement(By.CssSelector("[data-testid='task-title-input']")));
            Assert.That(
                taskInput.Displayed,
                Is.True,
                "Task form should remain open after failed submission");
        }

        [Test, Order(2)]
        public void CreateTask_ValidTitle_ShouldAppearInList()
        {
            var taskName = $"Test Task {DateTime.Now:HHmmss}";
    
            // Navigate to the first available list
            var firstList = wait.Until(d => 
                d.FindElements(By.CssSelector("[data-testid='list-title']")).First());
            firstList.Click();

            // Click the "Add a task" button
            var addTaskBtn = wait.Until(d => 
                d.FindElement(By.CssSelector("[data-testid='add-task-btn']")));
            addTaskBtn.Click();

            // Fill in the task name
            var taskInput = wait.Until(d => 
                d.FindElement(By.CssSelector("[data-testid='task-title-input']")));
            taskInput.SendKeys(taskName);

            // Click the submit button
            var submitBtn = wait.Until(d => 
                d.FindElement(By.CssSelector("[data-testid='submit-task-btn']")));
            submitBtn.Click();

            // Verify task appears in the list
            var createdTask = wait.Until(d =>
            {
                var tasks = d.FindElements(By.XPath("//span[contains(@class, 'font-medium')]"));
                return tasks.Any(t => t.Text.Contains(taskName));
            });
    
            Assert.That(createdTask, Is.True, $"Task '{taskName}' was not created successfully.");
        }

        [Test, Order(3)]
        public void ToggleTaskCompletion_ShouldUpdateStatus()
        {
            string taskName = "Checkbox Toggle Task";

            // Click add task button
            Driver.FindElement(By.CssSelector("[data-testid='add-task-btn']")).Click();

            // Type task title
            var input = Driver.FindElement(By.CssSelector("[data-testid='task-title-input']"));
            input.SendKeys(taskName);

            // Submit task
            Driver.FindElement(By.CssSelector("[data-testid='submit-task-btn']")).Click();

            // Wait for the new task element containing the taskName to appear
            var wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(5));
            var taskElement = wait.Until(d =>
            {
                var tasks = d.FindElements(By.CssSelector("[data-testid^='task-container-']"));
                var matchingTask = tasks.FirstOrDefault(e => e.Text.Contains(taskName));
                return matchingTask != null ? matchingTask : null;
            });

            string taskId = taskElement.GetAttribute("data-testid").Replace("task-container-", "");

            // Find and click the toggle checkbox
            var checkbox = Driver.FindElement(By.CssSelector($"[data-testid='task-toggle-{taskId}']"));
            checkbox.Click();

            // Wait until checkbox is selected (checked)
            wait.Until(d =>
            {
                var updatedCheckbox = d.FindElement(By.CssSelector($"[data-testid='task-toggle-{taskId}']"));
                return updatedCheckbox.Selected;
            });

            // Verify UI update
            var taskText = Driver.FindElement(By.CssSelector("[data-testid='task-text']"));
            var classAttr = taskText.GetAttribute("class");
            Assert.IsTrue(classAttr.Contains("line-through") && classAttr.Contains("text-green-600"));
        }

        [Test, Order(4)]
        public void EditTask_ShouldUpdateTitle()
        {
            // Create a unique task
            var timestamp = DateTime.Now.ToString("HHmmss");
            var originalName = $"Task {timestamp}";
    
            // Create the task
            Driver.FindElement(By.CssSelector("[data-testid='add-task-btn']")).Click();
            Thread.Sleep(500);
            Driver.FindElement(By.CssSelector("[data-testid='task-title-input']")).SendKeys(originalName);
            Thread.Sleep(500);
            Driver.FindElement(By.CssSelector("[data-testid='submit-task-btn']")).Click();
            Thread.Sleep(1000); // Wait for creation

            // Find the task we just created
            var allTaskTexts = Driver.FindElements(By.CssSelector("[data-testid='task-text']"));
            var targetTask = allTaskTexts.First(t => t.Text == originalName);
    
            // Click to edit
            targetTask.Click();
            Thread.Sleep(500); // Wait for edit form

            // Edit the title
            var newName = $"EDITED {timestamp}";
            Driver.FindElement(By.CssSelector("[data-testid='edit-task-input']")).Clear();
            Thread.Sleep(200);
            Driver.FindElement(By.CssSelector("[data-testid='edit-task-input']")).SendKeys(newName);
            Thread.Sleep(200);

            // Save changes
            Driver.FindElement(By.CssSelector("[data-testid='save-task-btn']")).Click();
            Thread.Sleep(1000); // Wait for save

            // Verify update
            var updatedTasks = Driver.FindElements(By.CssSelector("[data-testid='task-text']"));
            var updatedTask = updatedTasks.FirstOrDefault(t => t.Text == newName);
    
            Assert.IsNotNull(updatedTask, $"Task text did not change to '{newName}'");
            Assert.IsFalse(updatedTasks.Any(t => t.Text == originalName), "Old task title still exists");
        }
        
        
        [Test, Order(5)]
        public void DeleteTask_ShouldRemoveFromList()
        {
            //Create a test task
            var taskName = "Test Task " + DateTime.Now.ToString("HHmmss");
    
            // Click Add Task button
            Driver.FindElement(By.CssSelector("[data-testid='add-task-btn']")).Click();
    
            // Enter task name and submit
            Driver.FindElement(By.CssSelector("[data-testid='task-title-input']")).SendKeys(taskName);
            Driver.FindElement(By.CssSelector("[data-testid='submit-task-btn']")).Click();
    
            // Find the task's delete button
            var taskElement = Driver.FindElements(By.CssSelector("[data-testid^='task-container-']"))
                .First(t => t.Text.Contains(taskName));
    
            var deleteButton = taskElement.FindElement(By.CssSelector("[data-testid='delete-task-btn']"));
    
            //Click delete button
            deleteButton.Click();
    
            // Verify task is removed
            var remainingTasks = Driver.FindElements(By.CssSelector("[data-testid^='task-container-']"));
            Assert.IsFalse(remainingTasks.Any(t => t.Text.Contains(taskName)), 
                "Task should be deleted from the list");
        }
        private void LoginAndCreateTestList()
        {
            // Login
            Driver.Navigate().GoToUrl(PreviewUrl);
            Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
            Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
            Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();
            wait.Until(d => d.Url.Contains("/main/workspace"));

            // Create test list
            Driver.Navigate().GoToUrl(WorkspaceUrl);
            var newListButton = wait.Until(d => d.FindElement(By.CssSelector("[data-testid='new-list-btn']")));
            newListButton.Click();

            Driver.FindElement(By.Name("list-name")).SendKeys(testListName);
            
            var createListButton = wait.Until(d => d.FindElement(By.CssSelector("[data-testid='create-list']")));
            createListButton.Click();

            wait.Until(d => d.FindElements(By.CssSelector("[data-testid='list-title']"))
                .Any(el => el.Text.Contains(testListName)));
        }

        private void DeleteTestList()
        {
            try
            {
                // Find and delete the test list
                var deleteButtons = Driver.FindElements(By.CssSelector("[data-testid='delete-list-btn']"));
                var testListDeleteBtn = deleteButtons.FirstOrDefault(b => 
                    b.FindElement(By.XPath("./ancestor::div[contains(@class,'list-container')]"))
                    .FindElement(By.CssSelector("[data-testid='list-title']")).Text.Contains(testListName));

                if (testListDeleteBtn != null)
                {
                    testListDeleteBtn.Click();
                    wait.Until(d => d.FindElement(By.CssSelector(".swal2-confirm"))).Click();
                    wait.Until(d => d.FindElement(By.CssSelector(".swal2-popup")).Text.Contains("Deleted!"));
                    Driver.FindElement(By.CssSelector(".swal2-confirm")).Click();
                }
            }
            catch
            {
                // Ignore errors during cleanup
            }
        }

        private string CreateTestTask(string taskName)
        {
            // Click add task
            Driver.FindElement(By.CssSelector("[data-testid='add-task-btn']")).Click();
    
            // Enter task name
            var input = Driver.FindElement(By.CssSelector("[data-testid='task-title-input']"));
            input.SendKeys(taskName);
    
            // Submit
            Driver.FindElement(By.CssSelector("[data-testid='submit-task-btn']")).Click();
    
            // Wait for and return the new task's ID
            var taskElement = new WebDriverWait(Driver, TimeSpan.FromSeconds(3))
                .Until(d => d.FindElements(By.CssSelector("[data-testid^='task-container-']"))
                    .First(e => e.Text.Contains(taskName)));
    
            return taskElement.GetAttribute("data-testid").Replace("task-container-", "");
        }
}