import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GoogleAuthProvider } from "firebase/auth";

import { Functions, httpsCallable } from '@angular/fire/functions';

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
  increment
} from '@angular/fire/firestore';

import { 
  Auth, 
  User, 
  user, 
  signInWithPopup, 
  signOut 
} from '@angular/fire/auth';


import { Task } from './task/task';


const getObservable = (collection: CollectionReference<Task>) => {
  const subject = new BehaviorSubject<Task[]>([]);
  collectionData(collection, { idField: 'id' }).forEach((doc) => {
    subject.next(doc);
  });

  return subject;
};

@Injectable({
  providedIn: 'root'
})
export class FbconnService {

  private store: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private functions: Functions = inject(Functions);
  
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


  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      //handle user state changes here. Note, that user will be null if there is no currently logged in user.
      console.log('Current user info', aUser);
    });
    console.log(this.functions);

    const addMessage = httpsCallable(this.functions, 'getGreeting');
    addMessage()
      .then((result) => {
        console.log('result', result);
      })
      .catch((error) => {
        console.log('error', error);
      });
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

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
    this.userSubscription.unsubscribe();
  }

  newTask(task: Task, board: string): void {
    addDoc(collection(this.store, board), task);
  }

  deleteTask(taskId: string, board: string): void {
    deleteDoc(doc(collection(this.store, board), taskId));
  }

  updateTask(task: Task, board: string): void {
    updateDoc(doc(collection(this.store, board), task.id), {
        id: task.id,
        title: task.title,
        description: task.description,
      });
  }

  moveTask(task: Task, originBoard: string, targetBoard: string): void {
    runTransaction(this.store, (transaction) => {
      const promise = Promise.all([
        transaction.delete(
          doc(collection(this.store, originBoard), `${task.id}`)
        ),
        transaction.set(
          doc(collection(this.store, targetBoard), `${task.id}`),
          task
        ),
      ]);

      return promise;
    });
  }

  incrementViewCount(task: Task, board:string): void {
    updateDoc(doc(collection(this.store, board), task.id), {
      viewCount: increment(1),
    });
  }
}
