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
    private string testListName = $"Test List {Guid.NewGuid()}";
    private bool isTestListCreated = false;

    [SetUp]
    public void TestSetup()
    {
        wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(40));
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
        var firstList = wait.Until(d =>
            d.FindElements(By.CssSelector("[data-testid='list-title']")).First());
        firstList.Click();

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var addTaskBtn = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='add-task-btn']")));
        addTaskBtn.Click();

        var taskInput = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='task-title-input']")));

        var submitBtn = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='submit-task-btn']")));
        submitBtn.Click();

        bool isErrorShown = wait.Until(d =>
        {
            try
            {
                var errorPopup = d.FindElement(By.CssSelector(".swal2-popup"));
                return errorPopup.Displayed && errorPopup.Text.Contains("Task title cannot be empty.");
            }
            catch
            {
                return false;
            }
        });

        Assert.That(isErrorShown, Is.True, "Expected empty task title error did not appear.");

        var confirmBtn = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector(".swal2-confirm")));
        confirmBtn.Click();

        taskInput = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='task-title-input']")));
        Assert.That(taskInput.Displayed, Is.True, "Task form should remain open after failed submission");
    }

    [Test, Order(2)]
    public void CreateTask_ValidTitle_ShouldAppearInList()
    {
        var taskName = $"Test Task {DateTime.Now:HHmmss}";

        var firstList = wait.Until(d =>
            d.FindElements(By.CssSelector("[data-testid='list-title']")).First());
        firstList.Click();

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var addTaskBtn = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='add-task-btn']")));
        addTaskBtn.Click();

        var taskInput = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='task-title-input']")));
        taskInput.SendKeys(taskName);

        var submitBtn = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='submit-task-btn']")));
        submitBtn.Click();

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var createdTask = wait.Until(d =>
        {
            var tasks = d.FindElements(By.XPath("//span[contains(@class, 'font-medium')]"));
            return tasks.Any(t => t.Text.Contains(taskName));
        });

        Assert.That(createdTask, Is.True, $"Task '{taskName}' was not created successfully.");
    }

    [Test, Order(4)]
    public void EditTask_ShouldUpdateTitle()
    {
        var timestamp = DateTime.Now.ToString("HHmmss");
        var originalName = $"Task {timestamp}";
        var newName = $"EDITED {timestamp}";

        var taskId = CreateTestTask(originalName);

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var taskText = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector($"[data-testid='task-text-{taskId}']")));
        taskText.Click();

        var editInput = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='edit-task-input']")));
        editInput.Clear();
        editInput.SendKeys(newName);

        var saveBtn = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='save-task-btn']")));
        saveBtn.Click();

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var updatedTask = wait.Until(d =>
            d.FindElements(By.CssSelector("[data-testid='task-text']")).FirstOrDefault(t => t.Text == newName));

        Assert.IsNotNull(updatedTask, $"Task text did not change to '{newName}'");
        Assert.IsFalse(Driver.FindElements(By.CssSelector("[data-testid='task-text']")).Any(t => t.Text == originalName), "Old task title still exists");
    }

    [Test, Order(5)]
    public void DeleteTask_ShouldRemoveFromList()
    {
        var taskName = "Test Task " + DateTime.Now.ToString("HHmmss");
        var taskId = CreateTestTask(taskName);

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var taskElement = wait.Until(ExpectedConditions.ElementExists(By.CssSelector($"[data-testid='task-container-{taskId}']")));

        var deleteButton = taskElement.FindElement(By.CssSelector("[data-testid='delete-task-btn']"));
        deleteButton.Click();

        var confirmDelete = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector(".swal2-confirm")));
        confirmDelete.Click();

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var remainingTasks = Driver.FindElements(By.CssSelector("[data-testid^='task-container-']"));
        Assert.IsFalse(remainingTasks.Any(t => t.Text.Contains(taskName)), "Task should be deleted from the list");
    }

    private void LoginAndCreateTestList()
    {
        Driver.Navigate().GoToUrl(PreviewUrl);
        Driver.FindElement(By.Name("email")).SendKeys("endrit@musaj.com");
        Driver.FindElement(By.Name("password")).SendKeys("Endrit123456!");
        Driver.FindElement(By.CssSelector("[data-testid='login-btn']")).Click();

        wait.Until(d => d.Url.Contains("/main/workspace"));
        Driver.Navigate().GoToUrl(WorkspaceUrl);

        wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='new-list-btn']")));

        var listTitles = Driver.FindElements(By.CssSelector("[data-testid='list-title']"));
        bool exists = listTitles.Any(t => t.Text.Contains(testListName));

        if (!exists && !isTestListCreated)
        {
            var newListButton = Driver.FindElement(By.CssSelector("[data-testid='new-list-btn']"));
            newListButton.Click();

            Driver.FindElement(By.Name("list-name")).SendKeys(testListName);

            var createListButton = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='create-list']")));
            createListButton.Click();

            wait.Until(d => d.FindElements(By.CssSelector("[data-testid='list-title']")).Any(el => el.Text.Contains(testListName)));

            isTestListCreated = true;
        }
    }
     // [Test, Order(3)]
    // public void ToggleTaskCompletion_ShouldUpdateStatus()
    // {
    //     var taskName = "Test Task " + DateTime.Now.ToString("HHmmss");
    //     var taskId = CreateTestTask(taskName);

    //     wait.Until(ExpectedConditions.InvisibilityOfElementLocated(
    //         By.CssSelector(".swal2-container")));

    //     var checkbox = wait.Until(ExpectedConditions.ElementToBeClickable(
    //         By.CssSelector($"[data-testid='task-checkbox-{taskId}']")));
    //     var taskText = wait.Until(ExpectedConditions.ElementIsVisible(
    //         By.CssSelector($"[data-testid='task-text-{taskId}']")));

    //     Assert.IsFalse(checkbox.Selected, "Task should start unchecked");
    //     Assert.IsFalse(taskText.GetAttribute("class").Contains("line-through"), "Task should not be completed initially");

    //     checkbox.Click();

    //     Assert.IsTrue(checkbox.Selected, "Task should be checked after click");
    //     Assert.IsTrue(taskText.GetAttribute("class").Contains("line-through"), "Task should show completed style");

    //     checkbox.Click();

    //     Assert.IsFalse(checkbox.Selected, "Task should be unchecked after second click");
    //     Assert.IsFalse(taskText.GetAttribute("class").Contains("line-through"), "Task should no longer show completed style");
    // }



    private void DeleteTestList()
    {
        try
        {
            var deleteButtons = Driver.FindElements(By.CssSelector("[data-testid='delete-list-btn']"));
            var testListDeleteBtn = deleteButtons.FirstOrDefault(b =>
                b.FindElement(By.XPath("./ancestor::div[contains(@class,'list-container')]"))
                .FindElement(By.CssSelector("[data-testid='list-title']")).Text.Contains(testListName));

            if (testListDeleteBtn != null)
            {
                testListDeleteBtn.Click();
                wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector(".swal2-confirm"))).Click();
                wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));
            }
        }
        catch
        {
            // Ignore errors during cleanup
        }
    }

    private string CreateTestTask(string taskName)
    {
        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var addTaskBtn = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='add-task-btn']")));
        addTaskBtn.Click();

        var input = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='task-title-input']")));
        input.SendKeys(taskName);

        var submitBtn = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='submit-task-btn']")));
        submitBtn.Click();

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));
        Thread.Sleep(1000); 

        IWebElement taskElement = null;
        for (int i = 0; i < 10; i++)
        {
            Thread.Sleep(1000);
            var tasks = Driver.FindElements(By.CssSelector("[data-testid^='task-container-']"));
            taskElement = tasks.FirstOrDefault(t => t.Text.Contains(taskName));
            if (taskElement != null) break;
        }
        Assert.IsNotNull(taskElement, $"Task with name '{taskName}' was not found after creation.");

        return taskElement.GetAttribute("data-testid").Replace("task-container-", "");
    }
}
