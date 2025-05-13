/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Router,
  NavigationEnd,
  RouterLinkActive,
  RouterLink,
} from '@angular/router';
import { DOCUMENT, NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { ROUTES } from './sidebar-items';
import {  Role } from '@core';
import { RouteInfo } from './sidebar.metadata';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { NgScrollbar } from 'ngx-scrollbar';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { KeycloakConfig } from 'keycloak-js';
import { KeycloakService } from '@core/service/keycloak/keycloak.service';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    NgScrollbar,
    RouterLinkActive,
    RouterLink,
    NgClass,
    FeatherModule,
    TranslateModule,
  ],
})
export class SidebarComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  listMaxWidth?: string;
  userFullName?: string;
  userImg?: string;
  userType?: string;
  headerHeight = 60;
  currentRoute?: string;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    
    private router: Router,
    private ks:KeycloakService,
    private cookieService: CookieService
  ) {
    super();
    this.elementRef.nativeElement.closest('body');
    this.subs.sink = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
      }
    });
  }
  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
    }
  }
  callToggleMenu(event: Event, length: number) {
    if (length > 0) {
      const parentElement = (event.target as HTMLInputElement).closest('li');
      const activeClass = parentElement?.classList.contains('active');

      if (activeClass) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }
  profile;
  ngOnInit() {
      const profileString = this.cookieService.get('profile') ;
     this.profile = profileString ? JSON.parse(profileString) : null;
    if (this.ks.keycloak.authenticated) {
      const userRole = this.profile?.role;
      
      if(this.profile?.role==Role.CompanyAdmin)
      this.userFullName = this.profile?.name
      else
      this.userFullName = `${this.profile?.firstName} ${this.profile?.lastName}`
    
      this.userImg = this.profile.imageDir ;
      
      
      this.sidebarItems = ROUTES.filter(route => 
        route.role.includes('All') || 
        (userRole && route.role.includes(userRole))
      );
  
    
      this.userType = this.profile.role;
     
    }
  }

  initLeftSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }
  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }
  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'ls-closed');
    } else {
      this.renderer.removeClass(this.document.body, 'ls-closed');
    }
  }
  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }
  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }
 logout(): Promise<void> {
  return this.ks.keycloak.logout({
    redirectUri: window.location.origin 
  });
}
}
