using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Cverse.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace Cverse.Infrastructure.SignalR
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IConnectionManager _connectionManager;
        private readonly IServiceScopeFactory _scopeFactory;

        public ChatHub(IConnectionManager connectionManager, IServiceScopeFactory scopeFactory)
        {
            _connectionManager = connectionManager;
            _scopeFactory = scopeFactory;
        }

        public override async Task OnConnectedAsync()
        {
            var userIdString = Context.UserIdentifier;
            if (Guid.TryParse(userIdString, out var userId))
            {
                _connectionManager.AddConnection(userId, Context.ConnectionId);

                // Broadcast online status to all other users
                await Clients.Others.SendAsync("UserOnlineStatusChanged", userId, true, DateTime.UtcNow);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userIdString = Context.UserIdentifier;
            if (Guid.TryParse(userIdString, out var userId))
            {
                _connectionManager.RemoveConnection(userId, Context.ConnectionId);

                // Check if all sessions for this user are closed
                if (!_connectionManager.IsUserOnline(userId))
                {
                    var now = DateTime.UtcNow;
                    
                    // Update user's LastSeen in DB using scoped dbContext
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
                        if (user != null)
                        {
                            user.LastSeen = now;
                            await dbContext.SaveChangesAsync();
                        }
                    }

                    // Broadcast offline status with last seen timestamp to others
                    await Clients.Others.SendAsync("UserOnlineStatusChanged", userId, false, now);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendTypingStatus(Guid receiverId, bool isTyping)
        {
            var senderIdString = Context.UserIdentifier;
            if (Guid.TryParse(senderIdString, out var senderId))
            {
                // Forward typing status to the target recipient
                await Clients.User(receiverId.ToString()).SendAsync("OnUserTypingStatusChanged", senderId, isTyping);
            }
        }
    }
}
