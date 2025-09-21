# Controller based .NET Core Web API with Angular 20 frontend.

First of all, let's make sure we have the latest Angular CLI.
```bash
npm uninstall -g @angular/cli
npm install -g @angular/cli@latest
```

We are implementing the following tutorial for the backend.
https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-8.0&tabs=visual-studio-code

## Create the backend-project
We are creating a controller based web-API project called TodoApi that is using an in memory database.

```bash
dotnet new webapi --use-controllers -o TodoApi
cd TodoApi
dotnet add package Microsoft.EntityFrameworkCore.InMemory
code -r ../TodoApi
```

Now that the project is created, let's make sure we trust the development certificates.
```bash
dotnet dev-certs https --trust
```
Add a .gitignore file to the root folder. If you need to do this afterwards and you want to exclude folders that have already been checked in, you need to remove them from the git cache before they are ignored. This example excludes the wwwroot folder from the git-cache.

```bash
git rm --cached wwwroot -r
```
You can start the backend project with the following command.
```bash
dotnet run --launch-profile https
```

It has a Weatherforecasts endponit per default. You can view your current API using the swagger:
https://localhost:7190/swagger/index.html

## Create the model and datacontext.
Create a folder named Models and add two classes.

```csharp
namespace TodoApi.Models;

public class TodoItem
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public bool IsComplete { get; set; }
}


//Models/TodoContext.cs
using Microsoft.EntityFrameworkCore;

namespace TodoApi.Models;

public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options)
        : base(options)
    {
    }

    public DbSet<TodoItem> TodoItems { get; set; } = null!;
}
```

To use the datacontext, we need to register it using dependency injection. Open the Program.cs file and add the DbContext.
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

//Registrera DbContext med in-memory database
builder.Services.AddDbContext<TodoContext>(options =>
    options.UseInMemoryDatabase("ToDoList"));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
```

# Deploy backend-API and the Angular frontend as a single webapplication
To make sure the backend and frontend run as one application, we need to enable Static content and register the main page of the Angular application (index.html) as a fallback page, when the dotnet application doesn't have a matching route.
Continue to edit the Program.cs file by adding the following for when we're not in Development mode.

```csharp
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseStaticFiles();
    app.MapFallbackToFile("index.html"); // låt Angular ta över routing i prod
}
```
We will update the build output for the Angular application later on, to the wwwroot folder of the dotnet core application.

# Use scaffolding to generate a controller for our TodoItem model.
Our next step is to install the scaffolding engine. Makre sure you're in the todoApi folder and run the following commands. This will install the latest version of the code generator and unistall any previous version.

```bash
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet tool uninstall -g dotnet-aspnet-codegenerator
dotnet tool install -g dotnet-aspnet-codegenerator
dotnet tool update -g dotnet-aspnet-codegenerator
```

We are now able to generate our controller, based on the previously created model and datacontext.
```bash
dotnet aspnet-codegenerator controller -name TodoItemsController -async -api -m TodoItem -dc TodoContext -outDir Controllers
```
# Using DTO models to prevent properties to be exposed by the API
To examplify the use of Data-Transfer-Objects (DTO), we will now add an additional property to the TodoItem model. Let's call it secret. We will also create a new class TodoItemDTO, that does not contain the property from our database, that we don't want to expose using the API.

```csharp
//Models/TodoItem.cs
namespace TodoApi.Models
{
    public class TodoItem
    {
        public long Id { get; set; }
        public string? Name { get; set; }
        public bool IsComplete { get; set; }
        public string? Secret { get; set; }
    }
}

//Models/TodoItemDTO.cs
namespace TodoApi.Models;

public class TodoItemDTO
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public bool IsComplete { get; set; }
}
```

We update the Controller with a private method ItemToDTO, that copies our database model object, to a DTO object with only the visible properties. We use this method before we return data, and also update the controller methods to use the TodoItemDTO class as the model type.
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoApi.Models;
using TodoApi.Models;

namespace TodoApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoItemsController : ControllerBase
    {
        private readonly TodoContext _context;

        public TodoItemsController(TodoContext context)
        {
            _context = context;
        }

        // GET: api/TodoItems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TodoItemDTO>>> GetToDoItems()
        {
            return await _context.ToDoItems.Select(i => ItemToDTO(i)).ToListAsync();
        }

        // GET: api/TodoItems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TodoItemDTO>> GetTodoItem(long id)
        {
            var todoItem = await _context.ToDoItems.FindAsync(id);

            if (todoItem == null)
            {
                return NotFound();
            }

            return ItemToDTO(todoItem);
        }

        // PUT: api/TodoItems/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodoItem(long id, TodoItemDTO todoDTO)
        {
            if (id != todoDTO.Id)
            {
                return BadRequest();
            }

            var todoItem = await _context.ToDoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound();
            }
            todoItem.Name = todoDTO.Name;
            todoItem.IsComplete = todoDTO.IsComplete;

            _context.Entry(todoItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/TodoItems
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TodoItemDTO>> PostTodoItem(TodoItemDTO todoItemDTO)
        {
            var todoItem = new TodoItem
            {
                IsComplete = todoItemDTO.IsComplete,
                Name = todoItemDTO.Name
            };

            _context.ToDoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodoItem),new { id = todoItem.Id }, ItemToDTO(todoItem));
        }

        // DELETE: api/TodoItems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(long id)
        {
            var todoItem = await _context.ToDoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound();
            }

            _context.ToDoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static TodoItemDTO ItemToDTO(TodoItem todoItem) =>
            new TodoItemDTO
            {
                Id = todoItem.Id,
                Name = todoItem.Name,
                IsComplete = todoItem.IsComplete
            };
        
        private bool TodoItemExists(long id)
        {
            return _context.ToDoItems.Any(e => e.Id == id);
        }
    }
}

```

# Create the Angular frontend application
Ok. Let's create the Angular frontent. We do this from the TodoApi folder. I'm calling it clientApp and it will be generated as a subfolder of the main application.
```bash
ng new clientApp --routing --standalone --skip-git --skip-tests
```

Now that the angular app is created, we want to add a proxy file that tells the Angular application to redirect any call starting with /api to the backend application. Make sure to update the port if your app is running at another port than mine.
name the file **proxy.conf.json** and place it in the **clientApp/src** folder.
```json
{
  "/api": {
    "target": "https://localhost:7190",
    "secure": false,
    "changeOrigin": true
  }
}
```

To use the proxy file we create an npm command called start.
open the **clientApp/package.json** file and add the following command.

```json
"scripts": {
    "ng": "ng",
    "start": "ng serve --open --proxy-config src/proxy.conf.json",
```

We also want to change the build output, so that the generated files of the Angular application is placed in the **wwwroot** folder of the **todoApi** application.
Do this by editing the **angular.json** file. Set the **architect.build.optins.outputPath** to "../wwwroot".

```json
"architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "src/main.ts",
            "polyfills": [
              "zone.js"
            ],
            "outputPath": "../wwwroot",
```

# Genereate typescript models based on the API
We don't want to rewrite all models exposed by the API as typescript models manually. We can use **swagger** to generate the models for us. In this example, I'm only generating the data contracts, not the Api proxy. This is because I use Angular for the front end. I want to be able to add injectors to the webClient later.
Let's add another npm command to **clientApp/package.json**. The reason I'm using curl to save the swagger.json to disk, is that we avoid problems with self signed certificates that way.
```json
"scripts": {
    "ng": "ng",
    "start": "ng serve --open --proxy-config src/proxy.conf.json",
    "swagger-types": "curl -k https://localhost:7190/swagger/v1/swagger.json -o ./swagger.json && npx swagger-typescript-api generate -p ./swagger.json -o src/app/models --modular --templates typescript --no-client",
```
Run the code generation with the following command.
```bash
npm run swagger-types
```
The first time you run this command you will be asked to install a package **swagger-typescript-api@[version]**. Just answer y to install.

This will generate the file **clientApp/src/app/models/data-contracts.ts** with the generated data contracts. Also notis that you'll have a **swagger.json** file in your clientApp directory.

```typescript
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface TodoItemDTO {
  /** @format int64 */
  id?: number;
  name?: string | null;
  isComplete?: boolean;
}

export interface WeatherForecast {
  /** @format date */
  date?: string;
  /** @format int32 */
  temperatureC?: number;
  /** @format int32 */
  temperatureF?: number;
  summary?: string | null;
}
```

# Setting up some Angular CLI code generation standards
Let's make some adjustments to **angular.json** for this example. This is optional. I want a single file to be generated, with inline style and templates. I also like the generated files to have suffixes for the different types.
```json
"schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "skipTests": true,
          "inlineStyle": true,
          "inlineTemplate": true,
          "flat": true,
          "type": "component"
        },
        "@schematics/angular:class": {
          "skipTests": true
        },
        "@schematics/angular:directive": {
          "skipTests": true,
          "flat": true,
          "type": "directive"
        },
        "@schematics/angular:guard": {
          "skipTests": true
        },
        "@schematics/angular:interceptor": {
          "skipTests": true
        },
        "@schematics/angular:pipe": {
          "skipTests": true
        },
        "@schematics/angular:resolver": {
          "skipTests": true
        },
        "@schematics/angular:service": {
          "skipTests": true,
          "flat": true,
          "type": "service"
        }
      },
```
