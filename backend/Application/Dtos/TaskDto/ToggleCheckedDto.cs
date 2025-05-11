using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Dtos.TaskDto
{
  public class ToggleCheckedDto
{
    public int TaskId { get; set; }
    public bool IsChecked { get; set; }
}

}