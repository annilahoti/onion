using Application.Dtos.ListDtos;

namespace Application.Services.List;

public interface IListService
{
    Task<List<ListDto>> GetAllLists();
    Task<ListDto> GetListById(int listId);
    Task<List<ListDto>> GetListByOwnerId(string ownerId);
    Task<ListDto> CreateList(CreateListDto createListDto);
    Task<ListDto> UpdateList(UpdateListDto updateListDto);
    Task<ListDto> ChangeIndexList(ChangeIndexListDto changeIndexListDto);
    Task<ListDto> DeleteList(ListIdDto listIdDto);
}