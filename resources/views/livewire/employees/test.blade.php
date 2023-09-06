<div id="xxx">
    @include('livewire.employees.edit')
	<table >
		<thead>
			<tr>
                <td>#</td>
                <th>Name</th>
                <th>Due</th>
                <th>Comments</th>
                <th>Image</th>
                <td>ACTIONS</td>
            </tr>
		</thead>
		<tbody>
		    @forelse($employees as $row)
				<tr>
					<td>{{ $loop->iteration }}</td> 
					<td>{{ $row->name }}</td>
					<td>{{ $row->due }}</td>
					<td>{{ $row->comments }}</td>
					<td>{{ $row->image }}</td>
					<td >
					<div >
					<button data-bs-target="#updateDataModal" wire:click="edit({{ $row->id }})">Like Post</button>
					</div>
					</td>
				</tr>
			@empty
				<tr>
					<td >No data Found </td>
				</tr>
			@endforelse
        </tbody>
    </table>
</div>