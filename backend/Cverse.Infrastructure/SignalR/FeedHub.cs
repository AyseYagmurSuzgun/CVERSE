using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Cverse.Infrastructure.SignalR
{
    [Authorize]
    public class FeedHub : Hub
    {
        // Secured SignalR Hub specifically dedicated to social feed live broadcasts
    }
}
