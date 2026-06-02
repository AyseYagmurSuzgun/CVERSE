using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace Cverse.Infrastructure.SignalR
{
    public interface IConnectionManager
    {
        void AddConnection(Guid userId, string connectionId);
        void RemoveConnection(Guid userId, string connectionId);
        IEnumerable<string> GetConnections(Guid userId);
        IEnumerable<Guid> GetOnlineUsers();
        bool IsUserOnline(Guid userId);
    }

    public class ConnectionManager : IConnectionManager
    {
        private readonly ConcurrentDictionary<Guid, HashSet<string>> _userConnections = new();

        public void AddConnection(Guid userId, string connectionId)
        {
            _userConnections.AddOrUpdate(
                userId,
                new HashSet<string> { connectionId },
                (key, existingSet) =>
                {
                    lock (existingSet)
                    {
                        existingSet.Add(connectionId);
                    }
                    return existingSet;
                });
        }

        public void RemoveConnection(Guid userId, string connectionId)
        {
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                lock (connections)
                {
                    connections.Remove(connectionId);
                    if (connections.Count == 0)
                    {
                        _userConnections.TryRemove(userId, out _);
                    }
                }
            }
        }

        public IEnumerable<string> GetConnections(Guid userId)
        {
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                lock (connections)
                {
                    return connections.ToList();
                }
            }
            return Enumerable.Empty<string>();
        }

        public IEnumerable<Guid> GetOnlineUsers()
        {
            return _userConnections.Keys.ToList();
        }

        public bool IsUserOnline(Guid userId)
        {
            return _userConnections.ContainsKey(userId);
        }
    }
}
