// ==UserScript==
// @name         Timesheet Raw JSON Fetcher
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Fetch raw timesheetRows JSON and download it
// @author       You
// @match        https://lavieweb/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createButton() {
        const btn = document.createElement('button');
        btn.textContent = 'Download Raw Timesheet JSON';
        Object.assign(btn.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: '9999'
        });
        btn.addEventListener('click', fetchData);
        document.body.appendChild(btn);
    }

    async function fetchData() {
        const login = await fetch('https://lavieweb/TimeWebServer/api/loginA').then(r => r.json());
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth()).padStart(2, '0');
        const payload = {
            EmployeeNumber: login.employeeNumber,
            Year: year,
            Month: month,
            employeeEnterprise: login.employeeEnterprise
        };
        const headers = {
            'x-api-key': 'a2aa3262-4a46-40fb-8306-870daed1a672',
            'x-auth-token': login.token,
            'Content-Type': 'application/json'
        };
        const data = await fetch('https://lavieweb/TimeWebServer/api/TimesheetWsGet', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        }).then(r => r.json());

        const raw = data.timesheetRows;
        const blob = new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `timesheetRows_${year}_${month}.json`;
        link.click();

        console.log(raw);
        return raw;
    }

    window.addEventListener('load', createButton);
})();
