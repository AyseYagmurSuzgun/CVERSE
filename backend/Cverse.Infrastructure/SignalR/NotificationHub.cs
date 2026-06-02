using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Cverse.Infrastructure.SignalR
{
    [Authorize]
    public class NotificationHub : Hub
    {
        // Secured SignalR Hub specifically dedicated to user notifications
    }
}
