// RazorPartialRenderer.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace BelieveOrNot.Server.Services;

public interface IRazorPartialRenderer
{
    Task<string> RenderPartialAsync(string partialName, object model);
    Task<string> RenderPartialAsync(string partialName);
}

public class RazorPartialRenderer : IRazorPartialRenderer
{
    private readonly IRazorViewEngine _viewEngine;
    private readonly ITempDataProvider _tempDataProvider;
    private readonly IServiceProvider _serviceProvider;

    public RazorPartialRenderer(
        IRazorViewEngine viewEngine,
        ITempDataProvider tempDataProvider,
        IServiceProvider serviceProvider)
    {
        _viewEngine = viewEngine;
        _tempDataProvider = tempDataProvider;
        _serviceProvider = serviceProvider;
    }

    public Task<string> RenderPartialAsync(string partialName)
    {
        return RenderPartialAsync(partialName, new object());
    }

    public async Task<string> RenderPartialAsync(string partialName, object model)
    {
        var httpContext = new DefaultHttpContext { RequestServices = _serviceProvider };
        var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor());

        var viewResult = _viewEngine.FindView(actionContext, partialName, false);
        if (!viewResult.Success)
        {
            viewResult = _viewEngine.GetView(null, partialName, false);
        }

        if (!viewResult.Success)
        {
            throw new InvalidOperationException($"Partial view '{partialName}' not found. Searched: {string.Join(", ", viewResult.SearchedLocations ?? [])}");
        }

        await using var writer = new StringWriter();
        var viewData = new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
        {
            Model = model
        };
        var tempData = new TempDataDictionary(httpContext, _tempDataProvider);
        var viewContext = new ViewContext(actionContext, viewResult.View, viewData, tempData, writer, new HtmlHelperOptions());

        await viewResult.View.RenderAsync(viewContext);
        return writer.ToString();
    }
}
