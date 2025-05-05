using Domain.Entities;

namespace Domain.Interfaces;

public interface IListRepository
{
    Task<IEnumerable<List>> GetLists(
        int? listId = null,
        string ownerId = null,
        int? index = null
    );

    Task<List> CreateList(List list);
    Task<List> UpdateList(List list);
    Task<List> DeleteList(int listId);
}