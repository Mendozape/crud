<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Client;


class Clients extends Component
{
    
    public $due;
    public function render()
    {
        $clientes =Client::when($this->due, function ($query){
            return $query->where('due', '>',2);
        })->paginate(5); 
        return view('livewire.crud.clients',['clientes' => $clientes]);
    }
    public function updatingActive(){
        $this->resetPage();
    }
}
