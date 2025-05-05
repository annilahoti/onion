using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.ListDtos;

public class ChangeIndexListDto
{
    [Required]
    public int ListId { get; set; }
    [Required]
    public int newIndex { get; set; }
}