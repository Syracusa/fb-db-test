import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-slide-flow',
  templateUrl: './slide-flow.component.html',
  styleUrls: ['./slide-flow.component.css']
})
export class SlideFlowComponent {
  itemDivs: HTMLDivElement[] = [];
  mouseEnter = false;


  flow() {
    this.itemDivs.forEach((itemDiv, index) => {
      const left = parseInt(itemDiv.style.left, 10);
      if (left < -460) {
        itemDiv.style.left = '' + (this.itemDivs.length - 1) * 460 + 'px';
      } else {
        itemDiv.style.left = '' + (left - 1) + 'px';
      }
    });
  }

  flowAnimation() {
    if (!this.mouseEnter) {
      this.flow();
    }

    window.requestAnimationFrame(() => {
      this.flowAnimation();
    });
  }

  ngOnInit() {
    this.itemDivs = Array.from(document.querySelectorAll('.slide-flow-content'));
    for (let i = 0; i < this.itemDivs.length; i++) {
      this.itemDivs[i].style.left = '' + (i * 460) + 'px';
      this.itemDivs[i].style.top = '0px';
      this.itemDivs[i].onmouseenter = () => {
        console.log('mouseenter', i);
        this.mouseEnter = true;
      };
      this.itemDivs[i].onmouseleave = () => {
        console.log('mouseleave', i);
        this.mouseEnter = false;
      };
    }
    window.requestAnimationFrame(() => {
      this.flowAnimation();
    });
  }
}
