<div class="container-fluid">
	<div class="row justify-content-center">
		<div class="col-md-12">
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
										<i class="fa fa-plus"></i> Add Employees
									</div>
								</div>
							</div>
							<div class="card-body">
								@include('livewire.employees.create')
								@include('livewire.employees.edit')
								<div class="table-responsive">
									<table class="table  table-sm">
										<thead class="thead">
											<tr>
												<td>#</td>
												<th>Name</th>
												<th>Due</th>
												<th>Comments</th>
												<th>Image</th>
												<th>ACTIONS</th>
											</tr>
										</thead>
										<tbody>
											@forelse($data['employees'] as $row)
											@php
											$url = App\Http\Livewire\employees::getUrl($row->image);
											@endphp
											<tr>
												<td>{{ $loop->iteration }}</td>
												<td>{{ $row->name }}</td>
												<td>{{ $row->due }}</td>
												<td>{{ $row->comments }}</td>
												<td><img class="img img-circle" style="width:50px;" src="{{ $url }}" /></td>
												<td>
													<div class="dropdown">
														<a class="btn btn-sm btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
															Actions
														</a>
														<ul class="dropdown-menu">
															<li><a data-bs-toggle="modal" data-bs-target="#updateDataModal" class="dropdown-item" wire:click="edit({{ $row->id }})"><i class="fa fa-edit"></i> Edit </a></li>
															<li><a class="dropdown-item" wire:click="predestroy({{ $row->id }})"><i class="fa fa-trash"></i> Delete </a></li>
														</ul>
													</div>
												</td>
											</tr>
											@empty
											<tr>
												<td class="text-center" colspan="100%">No data Found </td>
											</tr>
											@endforelse
										</tbody>
									</table>
									<div class="float-end">{{ $data['employees']->links() }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>