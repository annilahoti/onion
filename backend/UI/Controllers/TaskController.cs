using Application.Dtos.TaskDto;
using Application.Services.Task;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UI.Controllers;

public class TaskController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TaskController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet("GetAllTasks")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllTasks()
    {
        try
        {
            var tasks = await _taskService.GetAllTasks();
            return Ok(tasks);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpGet("GetTaskById")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> GetTaskById(int taskId)
    {
        try
        {
            if (int.IsNegative(taskId))
            {
                return BadRequest("TaskId cannot be negative");
            }
            
            var task = await _taskService.GetTaskById(taskId);
            return Ok(task);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }
    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpGet("GetTaskByListId")]
    public async Task<IActionResult> GetTasksByListId(int listId)
    {
        try
        {
            if (Int32.IsNegative(listId)) return BadRequest("List Id is invalid");

            var tasks = await _taskService.GetTaskByListId(listId);

            return Ok(tasks);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }
    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpPost("CreateTask")]
   public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto createTaskDto)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var task = await _taskService.CreateTask(createTaskDto);
            return Ok(task);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }
    [Authorize(AuthenticationSchemes = "Bearer")]
    [HttpPut("UpdateTask")]
    public async Task<IActionResult> UpdateTask([FromQuery]UpdateTaskDto updateTaskDto)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var task = await _taskService.UpdateTask(updateTaskDto); 
            
            return Ok(task);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpDelete("DeleteTask")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> DeleteTask(TaskIdDto taskIdDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var task = await _taskService.DeleteTask(taskIdDto);
            return Ok(task);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpPut("ChangeTaskIndex")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> ChangeTaskIndex(ChangeIndexTaskDto changeIndexTaskDto)
    {
        try
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);
            
            var task = await _taskService.ChangeIndexTask(changeIndexTaskDto);
            return Ok(task);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpPut("ToggleChecked")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> ToggleChecked([FromBody] ToggleCheckedDto dto)
    {
        try
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _taskService.ToggleChecked(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

}