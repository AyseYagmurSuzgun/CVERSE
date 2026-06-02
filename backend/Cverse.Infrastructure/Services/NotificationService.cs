using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Cverse.Application.DTOs;
using Cverse.Application.Interfaces;
using Cverse.Domain.Entities;
using Cverse.Persistence.Context;
using Cverse.Infrastructure.SignalR;

namespace Cverse.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(AppDbContext context, IMapper mapper, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        public async Task<NotificationDto> CreateNotificationAsync(Guid userId, string type, string content, Guid? triggeredById)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = type,
                Content = content,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                TriggeredById = triggeredById
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            var savedNotification = await _context.Notifications
                .Include(n => n.TriggeredBy)
                .FirstOrDefaultAsync(n => n.Id == notification.Id);

            var dto = _mapper.Map<NotificationDto>(savedNotification);

            // Push real-time notification to the online target client
            await _hubContext.Clients.User(userId.ToString()).SendAsync("OnNotificationReceived", dto);

            return dto;
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId)
        {
            var notifications = await _context.Notifications
                .Include(n => n.TriggeredBy)
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();

            return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
        }

        public async Task<int> GetUnreadNotificationsCountAsync(Guid userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(Guid userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            if (!unreadNotifications.Any()) return true;

            foreach (var n in unreadNotifications)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
