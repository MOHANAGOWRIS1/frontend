import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HospitalService } from '../../services/hospital';
import { BloodRequest } from '../../models/blood-request.model';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-hospital',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hospital.html',
  styleUrl: './hospital.css'
})
export class HospitalComponent implements OnInit ,OnDestroy{

  requests: BloodRequest[] = [];
loadingLocation = false;
showHistory = false;
showNotifications = false;
notifications: string[] = [];
notificationCount = 0;

liveMessage: string = '';
private eventSource?: EventSource;

  form: BloodRequest = {
    patientName: '',
    age: 0,
    gender: '',
    bloodGroup: '',
    units: 1,
    hospitalName: '',
    hospitalAddress: '',
    location: { lat: null, lng: null }
  };

  constructor(private hospitalService: HospitalService,private zone:NgZone) {}

  ngOnInit() {
    this.loadRequests();
    this.connectToLiveUpdates();
  }

  loadRequests() {
    this.hospitalService.getRequests().subscribe(data => {
      this.requests = data;
    });
  }

connectToLiveUpdates() {
  this.eventSource = new EventSource('http://localhost:3001/api/hospital/stream');

  this.eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Ensure Angular change detection runs
    this.zone.run(() => {
      // Update table
      // this.requests = this.requests.map(r =>
      //   r._id === data._id ? data : r
      // );

      this.requests = this.requests.map(r =>
  r._id === data._id ? data : r
);


      const message = `Request for ${data.patientName} is now ${data.status}`;

      // Add to notification list
      this.notifications.unshift(message);
      this.notificationCount++;

      // Auto popup
      this.showNotifications = true;

      setTimeout(() => {
        // setTimeout is also outside zone
        this.showNotifications = false;
      }, 5000);
    });
  };
}
useCurrentLocation() {
  this.loadingLocation = true;

  if (!navigator.geolocation) {
    alert('Geolocation not supported');
    this.loadingLocation = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Store coordinates (also within zone so template updates immediately)
      this.zone.run(() => {
        this.form.location.lat = latitude;
        this.form.location.lng = longitude;
      });

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(res => res.json())
        .then(data => {
          this.zone.run(() => {
            this.form.hospitalAddress = data.display_name ?? '';
            this.loadingLocation = false;
          });
        })
        .catch(() => {
          this.zone.run(() => {
            alert('Failed to fetch address');
            this.loadingLocation = false;
          });
        });
    },
    () => {
      this.zone.run(() => {
        alert('Location permission denied');
        this.loadingLocation = false;
      });
    }
  );
}

// useCurrentLocation() {
//   this.loadingLocation = true;

//   if (!navigator.geolocation) {
//     alert('Geolocation not supported');
//     this.loadingLocation = false;
//     return;
//   }

//   navigator.geolocation.getCurrentPosition(
//     (position) => {
//       const { latitude, longitude } = position.coords;

//       fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
//         .then(res => res.json())
//         .then(data => {

//           // 🔥 IMPORTANT: Run inside Angular zone
//           this.zone.run(() => {
//             this.form.hospitalAddress = data.display_name;
//             this.loadingLocation = false;
//           });

//         })
//         .catch(() => {
//           this.zone.run(() => {
//             alert('Failed to fetch address');
//             this.loadingLocation = false;
//           });
//         });
//     },
//     () => {
//       this.zone.run(() => {
//         alert('Location permission denied');
//         this.loadingLocation = false;
//       });
//     }
//   );
// }
openHistory() {
  this.showHistory = true;
}

closeHistory() {
  this.showHistory = false;
}
clearNotifications() {
  this.notifications = [];
  this.notificationCount = 0;
}

toggleNotifications() {
  this.showNotifications = !this.showNotifications;

  if (this.showNotifications) {
    this.notificationCount = 0; // reset count when opened
  }
}

  submit() {
    this.hospitalService.createRequest(this.form).subscribe(() => {
      alert('Request Submitted Successfully');
      this.resetForm();
      this.loadRequests();
    });
  }

  resetForm() {
    this.form = {
      patientName: '',
      age: 0,
      gender: '',
      bloodGroup: '',
      units: 1,
      hospitalName: '',
      hospitalAddress: '',
      location: { lat: null, lng: null }
    };
 
  }
  
 ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

}
