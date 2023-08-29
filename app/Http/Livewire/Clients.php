<?php
namespace App\Http\Livewire;
use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Client;

class Clients extends Component
{
    use WithPagination;

	protected $paginationTheme = 'bootstrap';
    public $selected_id, $keyWord, $name, $due, $comments, $image;

    public function render()
    {
		$keyWord = '%'.$this->keyWord .'%';
        return view('livewire.clients.view', [
            'clients' => Client::latest()
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

        Client::create([ 
			'name' => $this-> name,
			'due' => $this-> due,
			'comments' => $this-> comments,
			'image' => $this-> image
        ]);
        
        $this->resetInput();
		$this->dispatchBrowserEvent('closeModal');
		session()->flash('message', 'Client Successfully created.');
    }

    public function edit($id)
    {
        $record = Client::findOrFail($id);
        $this->selected_id = $id; 
		$this->name = $record-> name;
		$this->due = $record-> due;
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
			$record = Client::find($this->selected_id);
            $record->update([ 
			'name' => $this-> name,
			'due' => $this-> due,
			'comments' => $this-> comments,
			'image' => $this-> image
            ]);

            $this->resetInput();
            $this->dispatchBrowserEvent('closeModal');
			session()->flash('message', 'Client Successfully updated.');
        }
    }

    public function destroy($id)
    {
        if ($id) {
            Client::where('id', $id)->delete();
        }
    }
}