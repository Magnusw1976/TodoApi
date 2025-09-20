using Microsoft.EntityFrameworkCore;
using TodoApi.Models;

namespace ToDoApi.Models
{
    public class TodoContext : DbContext
    {
        public TodoContext(DbContextOptions<TodoContext> options)
            : base(options)
        {
        }

        public DbSet<TodoItem> ToDoItems { get; set; }
    }
}