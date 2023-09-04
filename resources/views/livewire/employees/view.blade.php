<div class="container-fluid">
	<div class="row justify-content-center">
		<div class="col-md-12">
			<div class="card">
				<div class="card-header">
					<div style="display: flex; justify-content: space-between; align-items: center;">
						<div class="float-left">
							<h4><i class="fab fa-laravel text-info"></i>
							Employee Listing </h4>
						</div>
						@if (session()->has('message'))
						<div wire:poll.4s class="btn btn-sm btn-success" style="margin-top:0px; margin-bottom:0px;"> {{ session('message') }} </div>
						@endif
						<div>
							<input wire:model='keyWord' type="text" class="form-control" name="search" id="search" placeholder="Search Employees">
						</div>
						<div class="btn btn-sm btn-info" data-bs-toggle="modal" data-bs-target="#createDataModal">
						<i class="fa fa-plus"></i>  Add Employees
						</div>
					</div>
				</div>
				<div class="card-body">
						@include('livewire.employees.modals')
						
				<div class="table-responsive">
					<table class="table table-bordered table-sm">
						<thead class="thead">
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
								<td width="90">								
									<button type="button" wire:click="edit({{$row->id}})" class="btn btn-primary">Edit</button>
									@if($modal)
										@include('livewire.employees.edit')
									@endif
								</td>
							</tr>
							@empty
							<tr>
								<td class="text-center" colspan="100%">No data Found </td>
							</tr>
							@endforelse
						</tbody>
					</table>						
					<div class="float-end">{{ $employees->links() }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>