using System;
using System.Threading;
using System.Threading.Tasks;

namespace Gokturk.Application.Common.Interfaces;

public interface IBackgroundQueueService
{
    ValueTask QueueBackgroundWorkItemAsync(Func<IServiceProvider, CancellationToken, ValueTask> workItem);
}
