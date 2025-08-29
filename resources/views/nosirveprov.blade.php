@extends('adminlte::page')
@section('title', 'MY LARAVEL SYSTEM')
@include('top')
@section('content')
<section class="section">
    <div class="section-header" align="center">
        <h1>Notifications no jsx</h1>
    </div>
    <div class="section-body mt-2" >
        <div class="row">
            <div class="col-lg-12"> 
                <div class="card">
                    <div class="card-body" id="notis">
                        @if(auth()->user()->is_admin)
                          @forelse($data['notifications'] as $notification)
                            <div class="card bg-light text-white p-2 text-center">
                                [{{ $notification->created_at }}] User {{ $notification->data['name'] }} has just registered.
                                <a href="{{ route('NotiUpdate',$notification->id)}}" class="float-right mark-as-read" data-id="{{ $notification->id }}">
                                    Mark as read
                                </a>
                            </div>
                            @if($loop->last)
                            <div class="card bg-light text-white p-2 text-center">
                                <a href="{{ route('NotiUpdate','0')}}" data-id="{{ $notification->id }}">
                                    Mark all as read
                                </a>
                            </div>
                            @endif
                            @empty
                            <div class="card bg-light text-white p-2 text-center">
                            There are no new notifications
                            </div>
                          @endforelse
                        @endif

                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@stop
@section('js')
	@viteReactRefresh
	@vite('resources/js/app.js')
@stop


//import React from 'react';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
const Notifications = () => {
    const [isAdmin, setIsAdmin] = useState('');
    let notis = [ ];
    let notis2 = '';
    let notis3 = '';
    useEffect(() => {
        axios.get('/api/admin/isAdmin')
            .then(response => {
                setIsAdmin(response.data.admin);
                //setNotis(response.data);
            })
            .catch(error => {
                console.error('Error fetching admin: ', error);
            });
    }, []);

    if(isAdmin.length>=1){
        for (let Key in isAdmin) {
            notis.push(isAdmin[Key]);
        }

        notis = notis.map(row => (
            <>
                <li key={row.id}>[ { row.updated_at } ] User { row.data.name } has just registered.
                    <a href="route('route('NotiUpdate',4b4aaf53-2b65-48ac-84ac-9be8c181f25f)') " class='float-right mark-as-read' data-id='{{ row.id }}'> Mark as read</a>
                </li>
            </>
        ));
    }else{
        notis='no records found';
    }

    return (
        <>
            <section className="section">
                <div className="section-header" align="center">
                    <h1>Notifications</h1>
                </div>
                <div className="section-body mt-2">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body" >
                                {
                                notis
                                }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>

    );
};
export default Notifications;
//}
if (document.getElementById('notifications')) {
    createRoot(document.getElementById('notifications')).render(<Notifications />)
}