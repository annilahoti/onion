using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Repositories;

public class ListRepository : IListRepository
{
    private readonly AppDbContext _context;

    public ListRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<List>> GetLists(int? listId = null, string ownerId = null, int? index = null)
    {
        var query = _context.Lists
            //.Include(l => l.Tasks)
            .Include(l => l.User).AsQueryable();

        if (listId.HasValue)
            query = query.Where(l => l.ListId == listId);
        if (index.HasValue)
            query = query.Where(l => l.Index == index);
        if (!string.IsNullOrEmpty(ownerId))
            query = query.Where(l => l.OwnerId == ownerId);

        return await query.ToListAsync();

    }

    public async Task<List> CreateList(List list)
    {
        await _context.Lists.AddAsync(list);
        await _context.SaveChangesAsync();
        return list;
    }

    public async Task<List> UpdateList(List list)
    {
        var existingList = await _context.Lists.FindAsync(list.ListId);

        if (existingList == null)
            throw new Exception("List not found");
        
        _context.Entry(existingList).CurrentValues.SetValues(list);
        await _context.SaveChangesAsync();
        return existingList;
    }

    public async Task<List> DeleteList(int listId)
    {
        var list = await _context.Lists.FindAsync(listId);

        if (list == null)
            throw new Exception("List not found");

        list.IsDeleted = true;
        await _context.SaveChangesAsync();

        return list;
    }
}