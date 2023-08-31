<?php

namespace App\Http\Livewire;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Employee;

class Employees extends Component
{
    use WithPagination;

	protected $paginationTheme = 'bootstrap';
    public $selected_id, $keyWord, $name, $due, $comments, $image;

    public function render()
    {
		$keyWord = '%'.$this->keyWord .'%';
        return view('livewire.employees.view', [
            'employees' => Employee::latest()
						->orWhere('name', 'LIKE', $keyWord)
						->orWhere('due', 'LIKE', $keyWord)
						->orWhere('comments', 'LIKE', $keyWord)
						->orWhere('image', 'LIKE', $keyWord)
						->paginate(10),
        ]);
    }
	
    public function cancel()
    {
        $this->resetInput();
    }
	
    private function resetInput()
    {		
		$this->name = null;
		$this->due = null;
		$this->comments = null;
		$this->image = null;
    }

    public function store()
    {
        $this->validate([
		'name' => 'required',
		'due' => 'required',
		'comments' => 'required',
		'image' => 'required',
        ]);

        Employee::create([ 
			'name' => $this-> name,
			'due' => $this-> due,
			'comments' => $this-> comments,
			'image' => $this-> image
        ]);
        
        $this->resetInput();
		$this->dispatchBrowserEvent('closeModal');
		session()->flash('message', 'Employee Successfully created.');
    }

    public function edit($id)
    {
        $record = Employee::findOrFail($id);
        $this->selected_id = $id; 
		$this->name = '';
		$this->comments = $record-> comments;
		$this->image = $record-> image;
       
    }

    public function update()
    {
        $this->validate([
		'name' => 'required',
		'due' => 'required',
		'comments' => 'required',
		'image' => 'required',
        ]);

        if ($this->selected_id) {
			$record = Employee::find($this->selected_id);
            $record->update([ 
			'name' => $this-> name,
			'due' => $this-> due,
			'comments' => $this-> comments,
			'image' => $this-> image
            ]);

            $this->resetInput();
            $this->dispatchBrowserEvent('closeModal');
			session()->flash('message', 'Employee Successfully updated.');
        }
    }

    public function destroy($id)
    {
        if ($id) {
            Employee::where('id', $id)->delete();
        }
    }
}