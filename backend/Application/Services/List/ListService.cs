﻿using System.Text.RegularExpressions;
using Application.Dtos.ListDtos;
using Domain.Interfaces;

namespace Application.Services.List;

public class ListService : IListService
{
    private readonly IListRepository _listRepository;
    private readonly IUserRepository _userRepository;
    private readonly UserContext _userContext;

    public ListService(IListRepository listRepository, IUserRepository userRepository, UserContext userContext)
    {
        _listRepository = listRepository;
        _userRepository = userRepository;
        _userContext = userContext;
    }

    public async Task<List<ListDto>> GetAllLists()
    {
        var lists = await _listRepository.GetLists();
        var listsDto = new List<ListDto>();
        foreach (var list in lists)
        {
            listsDto.Add(new ListDto(list));
        }

        return listsDto;
    }
    
    public async Task<ListDto> GetListById(int listId)
    {
        var lists = await _listRepository.GetLists(listId: listId);
        var list = lists.FirstOrDefault(l => !l.IsDeleted);
        if (list == null)
            throw new Exception("List not found");
        
        if ((_userContext.Id != list.OwnerId) && _userContext.Role != "Admin")
            throw new Exception("You are not authorized");

        return new ListDto(list);
    }
public async Task<List<ListDto>> GetListByOwnerId(string ownerId)
{
    var user = (await _userRepository.GetUsers(userId: ownerId));
    if (!user.Any())
        throw new Exception("User not found");

    var lists = await _listRepository.GetLists(ownerId: ownerId);

    if (lists == null)
        throw new Exception("No List found");

    var filteredLists = lists.Where(l => !l.IsDeleted).ToList();

    var listDtos = new List<ListDto>();
    foreach (var list in filteredLists)
    {
        // Filtro taskat që nuk janë të fshira
        list.Tasks = list.Tasks?.Where(t => !t.IsDeleted).ToList();
        listDtos.Add(new ListDto(list));
    }

    return listDtos;
}

    public async Task<ListDto> CreateList(CreateListDto createListDto)
    {
        createListDto.Title = Regex.Replace(createListDto.Title?.Trim() ?? "", @"\s+", " ");
        if (string.IsNullOrWhiteSpace(createListDto.Title))
            throw new Exception("Title cannot be empty or whitespace only");
        
        var user = (await _userRepository.GetUsers(userId: createListDto.OwnerId));
        if (!user.Any())
            throw new Exception("User not found");
        
        if ((_userContext.Id != createListDto.OwnerId) && _userContext.Role != "Admin")
            throw new Exception("You are not authorized");

        var existingLists = (await _listRepository.GetLists(ownerId: createListDto.OwnerId)).Where(l => !l.IsDeleted);

        foreach (var existing_list in existingLists)
        {
            if (existing_list.Title.Equals(createListDto.Title))
                throw new Exception("You already have a list named: " + createListDto.Title);
        }
        
        if (existingLists.Count() >= 50)
            throw new Exception("You have reached the maximum number of lists allowed (50)");

        
        var newIndex = existingLists.Count();

        var newList = new Domain.Entities.List(
            createListDto.Title,
            newIndex,
            DateTime.Now,
            false,
            _userContext.Id
        );

        var list = await _listRepository.CreateList(newList);

        return new ListDto(list);

    }

    public async Task<ListDto> UpdateList(UpdateListDto updateListDto)
    {
        
        
        var lists = await _listRepository.GetLists(listId: updateListDto.ListId);
        var list = lists.FirstOrDefault(l => !l.IsDeleted);
        if (list == null)
            throw new Exception("List not found");
        
        if ((_userContext.Id != list.OwnerId) && _userContext.Role != "Admin")
            throw new Exception("You are not authorized");
        
        updateListDto.Title = Regex.Replace(updateListDto.Title?.Trim() ?? "", @"\s+", " ");
        if (string.IsNullOrWhiteSpace(updateListDto.Title))
            throw new Exception("Title cannot be empty or whitespace only");
        
        var existingLists = (await _listRepository.GetLists(ownerId: _userContext.Id)).Where(l => !l.IsDeleted);

        foreach (var existing_list in existingLists)
        {
            if (existing_list.Title.Equals(updateListDto.Title))
                throw new Exception("You already have a list named: " + updateListDto.Title);
        }
        
        list.ListId = updateListDto.ListId;
        list.Title = updateListDto.Title;

        var updatedList = await _listRepository.UpdateList(list);
        return new ListDto(updatedList);
    }

    public async Task<ListDto> ChangeIndexList(ChangeIndexListDto changeIndexListDto)
    {
        var list = await _listRepository.GetLists(listId: changeIndexListDto.ListId);
        var targetList = list.FirstOrDefault(l => !l.IsDeleted);
        if (targetList == null)
            throw new Exception("List not found");
        
        if ((_userContext.Id != targetList.OwnerId) && _userContext.Role != "Admin")
            throw new Exception("You are not authorized");
        
        int oldIndex = targetList.Index;
        int newIndex = changeIndexListDto.newIndex;
        
        if (oldIndex == newIndex)
            return new ListDto(targetList);

        var allLists = await _listRepository.GetLists(ownerId: targetList.OwnerId);
        var orderedLists = allLists.Where(l => !l.IsDeleted).OrderBy(l => l.Index).ToList();
        
        // Remove the list we're moving
        orderedLists.Remove(targetList);

        // Insert at new position
        orderedLists.Insert(newIndex, targetList);

        // Update indices of all lists
        for (int i = 0; i < orderedLists.Count; i++)
        {
            orderedLists[i].Index = i;
            await _listRepository.UpdateList(orderedLists[i]);
        }

        return new ListDto(targetList);
    }

    public async Task<ListDto> DeleteList(ListIdDto listIdDto)
    {
        var lists = await _listRepository.GetLists(listId: listIdDto.ListId);
        var list = lists.FirstOrDefault();
        if (list == null)
            throw new Exception("List not found");

        if ((_userContext.Id != list.OwnerId) && _userContext.Role != "Admin")
            throw new Exception("You are not authorized");

        list.IsDeleted = !list.IsDeleted;
        var updatedList = await _listRepository.UpdateList(list);

        var siblingList = await _listRepository.GetLists(ownerId: _userContext.Id);
        var affectedLists = siblingList
            .Where(l => !l.IsDeleted && l.Index > list.Index)
            .OrderBy(l => l.Index)
            .ToList();
        
        foreach (var l in affectedLists)
        {
            l.Index -= 1;
            await _listRepository.UpdateList(l);
        }

        return new ListDto(updatedList);
    }
}