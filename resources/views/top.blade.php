@section('content_header')
    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pusher/8.3.0/pusher.min.js" integrity="sha512-tXL5mrkSoP49uQf2jO0LbvzMyFgki//znmq0wYXGq94gVF6TU0QlrSbwGuPpKTeN1mIjReeqKZ4/NJPjHN1d2Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/laravel-echo/1.15.3/echo.js"></script>
    <script>
    // Enable pusher logging - don't include this in production
    //Pusher.logToConsole = true;
    var pusher = new Pusher('66e12194484209bfb23d', {
        cluster: 'mt1'
    });
    var channel = pusher.subscribe('my-channel');
    channel.bind('my-event', function(data) {
        //alert(JSON.stringify(data.username));
        document.getElementById("NumNoti").textContent = 9;
        //document.getElementById("demo").innerHTML ='sdfsf';
    });
    var channel = pusher.subscribe('EmployeesChannel');
    channel.bind('EmployeesEvent', function(event) {
        //alert(JSON.stringify(data.username));
        //event.unread.foreach(function(row){
        document.getElementById("NumMess").textContent = event.NumNoti;
        document.getElementById("notis").innerHTML =event.unread;

        //alert(JSON.stringify('asdsad:'+event.unread[0].data['name']));
        //alert(JSON.stringify(html));
        //})
    });
    </script>
@stop
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