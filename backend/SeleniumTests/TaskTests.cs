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
        OpenFirstList();

        wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='add-task-btn']"))).Click();
        wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='task-title-input']")));
        wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='submit-task-btn']"))).Click();

        bool isErrorShown = wait.Until(driver =>
        {
            try
            {
                var errorPopup = driver.FindElement(By.CssSelector(".swal2-popup"));
                return errorPopup.Displayed && errorPopup.Text.Contains("Task title cannot be empty.");
            }
            catch { return false; }
        });

        Assert.That(isErrorShown, Is.True, "Expected error popup for empty task title did not appear.");

        wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector(".swal2-confirm"))).Click();

        var taskInput = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='task-title-input']")));
        Assert.That(taskInput.Displayed, Is.True, "Task form should remain open after error.");
    }

    [Test, Order(2)]
    public void CreateTask_ValidTitle_ShouldAppearInList()
    {
        var taskName = $"Test Task {DateTime.Now:HHmmss}";
        OpenFirstList();
        CreateTask(taskName);

        bool taskCreated = wait.Until(d =>
        {
            var tasks = d.FindElements(By.XPath("//span[contains(@class, 'font-medium')]"));
            return tasks.Any(t => t.Text.Contains(taskName));
        });

        Assert.That(taskCreated, Is.True, $"Task '{taskName}' was not created successfully.");
    }

    [Test, Order(3)]
    public void ToggleTaskCompletion_ShouldUpdateStatus()
    {
        var taskName = "Test Task " + DateTime.Now.ToString("HHmmss");
        var taskId = CreateTestTask(taskName);

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var checkbox = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector($"[data-testid='task-checkbox-{taskId}']")));
        var taskText = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector($"[data-testid='task-text-{taskId}']")));

        Assert.IsFalse(checkbox.Selected, "Task should start unchecked");
        Assert.IsFalse(taskText.GetAttribute("class").Contains("line-through"), "Task should not be completed initially");

        checkbox.Click();

        Assert.IsTrue(checkbox.Selected, "Task should be checked after click");
        Assert.IsTrue(taskText.GetAttribute("class").Contains("line-through"), "Task should show completed style");

        checkbox.Click();

        Assert.IsFalse(checkbox.Selected, "Task should be unchecked after second click");
        Assert.IsFalse(taskText.GetAttribute("class").Contains("line-through"), "Task should no longer show completed style");
    }

    [Test, Order(4)]
    public void EditTask_ShouldUpdateTitle()
    {
        var timestamp = DateTime.Now.ToString("HHmmss");
        var originalName = $"Task {timestamp}";
        var newName = $"EDITED {timestamp}";
        var taskId = CreateTestTask(originalName);

        var taskText = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector($"[data-testid='task-text-{taskId}']")));
        taskText.Click();

        var editInput = wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='edit-task-input']")));
        editInput.Clear();
        editInput.SendKeys(newName);

        var saveBtn = wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='save-task-btn']")));
        saveBtn.Click();

        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));

        var updatedTask = wait.Until(driver =>
        {
            var tasks = driver.FindElements(By.CssSelector("[data-testid='task-text']"));
            return tasks.FirstOrDefault(t => t.Text == newName);
        });

        Assert.IsNotNull(updatedTask, $"Task text did not change to '{newName}'");
        Assert.IsFalse(Driver.FindElements(By.CssSelector("[data-testid='task-text']")).Any(t => t.Text == originalName), "Old task title still exists");
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

        if (!isTestListCreated)
        {
            var exists = Driver.FindElements(By.CssSelector("[data-testid='list-title']")).Any(e => e.Text.Contains(testListName));
            if (!exists)
            {
                Driver.FindElement(By.CssSelector("[data-testid='new-list-btn']")).Click();
                Driver.FindElement(By.Name("list-name")).SendKeys(testListName);
                wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='create-list']"))).Click();
                wait.Until(d => d.FindElements(By.CssSelector("[data-testid='list-title']")).Any(el => el.Text.Contains(testListName)));
                isTestListCreated = true;
            }
        }
    }

    private void DeleteTestList()
    {
        try
        {
            var deleteButtons = Driver.FindElements(By.CssSelector("[data-testid='delete-list-btn']"));
            var btn = deleteButtons.FirstOrDefault(b =>
                b.FindElement(By.XPath("./ancestor::div[contains(@class,'list-container')]"))
                .FindElement(By.CssSelector("[data-testid='list-title']")).Text.Contains(testListName));

            if (btn != null)
            {
                btn.Click();
                wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector(".swal2-confirm"))).Click();
                wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));
            }
        }
        catch { }
    }

    private void OpenFirstList()
    {
        wait.Until(d => d.FindElements(By.CssSelector("[data-testid='list-title']")).First()).Click();
        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));
    }

    private void CreateTask(string taskName)
    {
        wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='add-task-btn']"))).Click();
        wait.Until(ExpectedConditions.ElementIsVisible(By.CssSelector("[data-testid='task-title-input']"))).SendKeys(taskName);
        wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("[data-testid='submit-task-btn']"))).Click();
        wait.Until(ExpectedConditions.InvisibilityOfElementLocated(By.CssSelector(".swal2-container")));
    }

    private string CreateTestTask(string taskName)
    {
        OpenFirstList();
        CreateTask(taskName);

        var taskElement = new WebDriverWait(Driver, TimeSpan.FromSeconds(30))
            .Until(d =>
            {
                var tasks = d.FindElements(By.CssSelector("[data-testid^='task-container-']"));
                return tasks.FirstOrDefault(t => t.Text.Contains(taskName));
            });

        if (taskElement == null)
        {
            Console.WriteLine("❌ Task not found. Tasks visible:");
            foreach (var task in Driver.FindElements(By.CssSelector("[data-testid^='task-container-']")))
            {
                Console.WriteLine(" - " + task.Text);
            }
        }

        Assert.IsNotNull(taskElement, $"Task with name '{taskName}' was not found after creation.");
        return taskElement.GetAttribute("data-testid").Replace("task-container-", "");
    }
}
