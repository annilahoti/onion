using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.ListDtos;

public class CreateListDto
{
    [Required]
    public string Title { get; set; }

    [Required] public string OwnerId { get; set; }
}