import { Component, inject } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent, TaskDialogResult } from './task-dialog/task-dialog.component';
import {
  Firestore,
  collection,
  doc,
  runTransaction,
  deleteDoc,
  updateDoc,
  addDoc,
  CollectionReference,
  collectionData,
} from '@angular/fire/firestore';

import { Auth, User, user, signInWithPopup, signOut } from '@angular/fire/auth';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GoogleAuthProvider } from "firebase/auth";



const getObservable = (collection: CollectionReference<Task>) => {
  const subject = new BehaviorSubject<Task[]>([]);
  collectionData(collection, { idField: 'id' }).forEach((doc) => {
    subject.next(doc);
  });

  return subject;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fb-db-test';

  private store: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  user$ = user(this.auth);
  userSubscription: Subscription;

  authProvider = new GoogleAuthProvider();


  todo = getObservable(
    collection(this.store, 'todo') as CollectionReference<Task>
  ) as Observable<Task[]>;
  inProgress = getObservable(
    collection(this.store, 'inProgress') as CollectionReference<Task>
  ) as Observable<Task[]>;
  done = getObservable(
    collection(this.store, 'done') as CollectionReference<Task>
  ) as Observable<Task[]>;


  constructor(private dialog: MatDialog) {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      //handle user state changes here. Note, that user will be null if there is no currently logged in user.
      console.log(aUser);
    });
  }

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
    this.userSubscription.unsubscribe();
  }

  login(): void {
    signInWithPopup(this.auth, this.authProvider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential!.accessToken;
      const user = result.user;
      console.log(token, user);
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.log(errorCode, errorMessage, email, credential);
    });
  }

  logout(): void {
    signOut(this.auth).then(() => {
      console.log('Logout successful');
    }).catch((error) => {
      console.log('Logout failed', error);
    });
  }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        addDoc(collection(this.store, 'todo'), result.task);
      });
  }

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }

        if (result.delete) {
          deleteDoc(doc(collection(this.store, list), `${task.id}`));
        } else {
          updateDoc(doc(collection(this.store, list), `${task.id}`), {
            id: task.id,
            title: task.title,
            description: task.description,
          });
        }
      });
  }

  drop(event: CdkDragDrop<Task[] | null, any, any>): void {
    if (event.previousContainer === event.container) {
      return;
    }

    const item = event.previousContainer.data[event.previousIndex] as Task;
    runTransaction(this.store, (transaction) => {
      const promise = Promise.all([
        transaction.delete(
          doc(collection(this.store, event.previousContainer.id), `${item.id}`)
        ),
        transaction.set(
          doc(collection(this.store, event.container.id), `${item.id}`),
          item
        ),
      ]);

      return promise;
    });
    transferArrayItem(
      event.previousContainer.data,
      event.container.data!,
      event.previousIndex,
      event.currentIndex
    );
  }

}
