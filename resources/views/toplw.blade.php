@section('content_top_nav_right')
    <li class="nav-item dropdown">
        <a class="nav-link" data-toggle="dropdown" href="#" aria-expanded="false">
            <i class="far fa-comments"></i>
            <span class="badge badge-warning navbar-badge" id="NumNoti">6</span>
        </a>
        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right" style="left: inherit; right: 0px;">
            <span class="dropdown-item dropdown-header">15 Notifications</span>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
                <i class="fas fa-envelope mr-2"></i> 4 new messages
                <span class="float-right text-muted text-sm">3 mins</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
                <i class="fas fa-users mr-2"></i> 8 friend requests
                <span class="float-right text-muted text-sm">12 hours</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
                <i class="fas fa-file mr-2"></i> 3 new reports
                <span class="float-right text-muted text-sm">2 days</span>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
        </div>
    </li>
    @if(isset(auth()->user()->unreadNotifications))
        <li class="nav-item dropdown">
            @if(auth()->user()->is_admin)
            <a class="nav-link" data-toggle="dropdown" href="#" aria-expanded="false">
                <i class="far fa-bell"></i>
                <span class="badge badge-warning navbar-badge" id="NumMess">{{auth()->user()->unreadNotifications->count()}}</span>
            </a>
            @endif
            <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right" style="left: inherit; right: 0px;">
                <span class="dropdown-item dropdown-header"> Unread Notifications</span>
                <div class="dropdown-divider"></div>
                @if(auth()->user()->is_admin)
                    @forelse(auth()->user()->unreadNotifications as $notification)
                    <a href="#" class="dropdown-item">
                        <i class="fas fa-envelope mr-2"></i> {{ $notification->created_at }}
                    </a>
                @empty
                <div class="card bg-light text-white p-2 text-center">
                    There are no new notifications
                </div>
                @endforelse
                @endif
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item dropdown-footer">See All Notifications</a>
            </div>
        </li>
    @endif
@stop