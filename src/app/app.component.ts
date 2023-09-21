import { Component, inject } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent, TaskDialogResult } from './task-dialog/task-dialog.component';

import { FbconnService } from './fbconn.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fb-db-test';

  private dialog: MatDialog = inject(MatDialog);
  public fbconn: FbconnService = inject(FbconnService);

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {
          count: 0,
        },
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        this.fbconn.newTask(result.task, 'todo');
      });
  }

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    this.fbconn.incrementViewCount(task, list);
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
          if (task.id)
            this.fbconn.deleteTask(task.id, list);
        } else {
          this.fbconn.updateTask(task, list);
        }
      });
  }

  drop(event: CdkDragDrop<Task[] | null, any, any>): void {
    if (event.previousContainer === event.container) {
      return;
    }

    const item = event.previousContainer.data[event.previousIndex] as Task;
    this.fbconn.moveTask(item, event.previousContainer.id, event.container.id);

    transferArrayItem(
      event.previousContainer.data,
      event.container.data!,
      event.previousIndex,
      event.currentIndex
    );
  }

}
