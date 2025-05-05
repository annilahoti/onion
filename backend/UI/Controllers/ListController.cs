using Application.Dtos.ListDtos;
using Application.Services.List;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UI.Controllers;

public class ListController : ControllerBase
{
    private readonly IListService _listService;

    public ListController(IListService listService)
    {
        _listService = listService;
    }

    
    [HttpGet("GetAllLists")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAllLists()
    {
        try
        {
            var lists = await _listService.GetAllLists();
            return Ok(lists);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }
    
    [HttpGet("GetListById")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> GetLisById(int listId)
    {
        try
        {
            if (int.IsNegative(listId))
            {
                return BadRequest("List Id can not be negative");
            }

            var list = await _listService.GetListById(listId);
            return Ok(list);

        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpGet("GetListByOwnerId")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> GetListByOwnerId(string ownerId)
    {
        try
        {
            if (string.IsNullOrEmpty(ownerId))
                return BadRequest("User Id is invalid");

            var lists = await _listService.GetListByOwnerId(ownerId);
            return Ok(lists);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpPost("CreateList")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> CreateList(CreateListDto createListDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var list = await _listService.CreateList(createListDto);
            return Ok(list);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }
    
    [HttpPut("UpdateList")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> UpdateList(UpdateListDto updateListDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var list = await _listService.UpdateList(updateListDto);
            return Ok(list);

        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

    [HttpPut("ChangeIndexList")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> ChangeIndexlist(ChangeIndexListDto changeIndexListDto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var list = await _listService.ChangeIndexList(changeIndexListDto);
            return Ok(list);
        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }
    
    [HttpDelete("DeleteList")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> DeleteList(ListIdDto listIdDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var list = await _listService.DeleteList(listIdDto);
            return Ok(list);

        }
        catch (Exception e)
        {
            return StatusCode(500, e.Message);
        }
    }

}