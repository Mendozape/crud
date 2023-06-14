
            <table class="table" align="center">
              <head>
                <tr align="left">
                  <th style="display:none;">ID</th>
                  <th>Nombre</th>
                  <th>E-mail</th>
                  <th>Role</th>
                </tr>
              </head>
              <tbody>
                @foreach ($usuarios as $details)
                <tr>
                  <td style="display:none;">{{ $details->id }}</td>
                  <td>{{ $details->name }}</td>
                  <td>{{ $details->email }}</td>
                  <td>
                    @if(!empty($details->getRoleNames()))
                        @foreach($details->getRoleNames() as $roleName)
                        <h5><span class="btn btn-primary btn-sm">{{$roleName}}</span></h5>
                        @endforeach
                    @endif
                  </td>
                </tr>
                @endforeach
              </tbody>
            </table>