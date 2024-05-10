using Microsoft.AspNetCore.Mvc;
using storeApi.Models.Data;
using System;
using System.Collections.Generic;

namespace storeApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoreController : ControllerBase
    {
        [HttpGet]
         public async Task<IActionResult> GetStore()
        {
            var store = await Store.Instance;
            return Ok(new
            {
                Products = store.Products,
                TaxPercentage = store.TaxPercentage,
                Categories=store.Categories
            });
        }
        [HttpGet("Products")]
         public async Task<IActionResult> GetCategoriesAsync(int categoryID)
        {
            if (categoryID<1)throw new ArgumentException($"La categoria {nameof(categoryID)} no puede ser negativa o cero.");
             var store = await Store.Instance;
             var filteredProducts= store.getProductosCategoryID(categoryID);
            return Ok(new{filteredProducts});
        }
    }

}