using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.ListDtos;

public class UpdateListDto
{
    [Required]
    public int ListId { get; set; }
    [Required]
    [MinLength(2, ErrorMessage = "Title must be at least 2 characters long")]
    [MaxLength(50, ErrorMessage = "Title cannot exceed 50 characters")]
    public string Title { get; set; }
}