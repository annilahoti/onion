using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.UserDtos;

public class RegisterDto
{
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", 
        ErrorMessage = "Password must have at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be at least 8 characters long.")]
    public string Password { get; set; }
}