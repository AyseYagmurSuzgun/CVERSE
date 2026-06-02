using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Cverse.Application.DTOs;

namespace Cverse.Application.Interfaces
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateNotificationAsync(Guid userId, string type, string content, Guid? triggeredById);
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId);
        Task<int> GetUnreadNotificationsCountAsync(Guid userId);
        Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId);
        Task<bool> MarkAllAsReadAsync(Guid userId);
    }
}
