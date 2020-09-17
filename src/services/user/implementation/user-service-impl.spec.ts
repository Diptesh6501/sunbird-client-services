import {CsUserService} from '../interface';
import {CsHttpService, CsResponse} from '../../../core/http-service/interface';
import {Container} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {UserServiceImpl} from './user-service-impl';
import {of} from 'rxjs';
import {UserDeclarationOperation} from '../../../models/user';

describe('UserServiceImpl', () => {
    let userService: CsUserService;
    const mockHttpService: Partial<CsHttpService> = {};
    const mockApiPath = 'MOCK_API_PATH';

    beforeAll(() => {
        const container = new Container();

        container.bind<CsHttpService>(InjectionTokens.core.HTTP_SERVICE).toConstantValue(mockHttpService as CsHttpService);
        container.bind<string>(InjectionTokens.services.user.USER_SERVICE_API_PATH).toConstantValue(mockApiPath);

        container.bind<CsUserService>(InjectionTokens.services.user.USER_SERVICE).to(UserServiceImpl).inSingletonScope();

        userService = container.get<CsUserService>(InjectionTokens.services.user.USER_SERVICE);
    });

    beforeEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    it('should be able to get an instance from the container', () => {
        expect(userService).toBeTruthy();
    });

    describe('checkUserExists()', () => {
        describe('when captchaResponse is not passed', () => {
            it('should be able to check if user exists with matching fields in request', (done) => {
                mockHttpService.fetch = jest.fn(() => {
                    const response = new CsResponse();
                    response.responseCode = 200;
                    response.body = {
                        result: {
                            exists: true,
                            id: 'SOME_USER_ID',
                            userId: 'SOME_USER_ID',
                            name: 'SOME_NAME',
                            managedBy: 'SOME_OTHER_USER_ID'
                        }
                    };
                    return of(response);
                });

                userService.checkUserExists({
                    key: 'userId',
                    value: 'SOME_USER_ID'
                }).subscribe((r) => {
                    expect(mockHttpService.fetch).toHaveBeenCalledWith(expect.objectContaining({
                        type: 'GET',
                        path: expect.stringContaining('/exists/userId/SOME_USER_ID')
                    }));
                    expect(r).toEqual({
                        exists: true,
                        id: 'SOME_USER_ID',
                        userId: 'SOME_USER_ID',
                        name: 'SOME_NAME',
                        managedBy: 'SOME_OTHER_USER_ID'
                    });
                    done();
                });
            });
        });

        describe('when captchaResponse is passed', () => {
            it('should be able to check if user exists with matching fields in request with only token', (done) => {
                mockHttpService.fetch = jest.fn(() => {
                    const response = new CsResponse();
                    response.responseCode = 200;
                    response.body = {
                        result: {
                            exists: true,
                            id: 'SOME_USER_ID',
                            userId: 'SOME_USER_ID',
                            name: 'SOME_NAME',
                            managedBy: 'SOME_OTHER_USER_ID'
                        }
                    };
                    return of(response);
                });

                userService.checkUserExists({
                    key: 'userId',
                    value: 'SOME_USER_ID'
                }, {token: 'SOME_CAPTCHA_RESPONSE_TOKEN'}).subscribe((r) => {
                    expect(mockHttpService.fetch).toHaveBeenCalledWith(expect.objectContaining({
                        type: 'GET',
                        path: expect.stringContaining('/exists/userId/SOME_USER_ID'),
                        parameters: {
                            captchaResponse: 'SOME_CAPTCHA_RESPONSE_TOKEN',
                        }
                    }));
                    expect(r).toEqual({
                        exists: true,
                        id: 'SOME_USER_ID',
                        userId: 'SOME_USER_ID',
                        name: 'SOME_NAME',
                        managedBy: 'SOME_OTHER_USER_ID'
                    });
                    done();
                });
            });

            it('should be able to check if user exists with matching fields in request with token and app type', (done) => {
                mockHttpService.fetch = jest.fn(() => {
                    const response = new CsResponse();
                    response.responseCode = 200;
                    response.body = {
                        result: {
                            exists: true,
                            id: 'SOME_USER_ID',
                            userId: 'SOME_USER_ID',
                            name: 'SOME_NAME',
                            managedBy: 'SOME_OTHER_USER_ID'
                        }
                    };
                    return of(response);
                });

                userService.checkUserExists({
                    key: 'userId',
                    value: 'SOME_USER_ID'
                }, {token: 'SOME_CAPTCHA_RESPONSE_TOKEN', app: '1'}).subscribe((r) => {
                    expect(mockHttpService.fetch).toHaveBeenCalledWith(expect.objectContaining({
                        type: 'GET',
                        path: expect.stringContaining('/exists/userId/SOME_USER_ID'),
                        parameters: expect.objectContaining({
                            captchaResponse: 'SOME_CAPTCHA_RESPONSE_TOKEN',
                            app: '1'
                        })
                    }));
                    expect(r).toEqual({
                        exists: true,
                        id: 'SOME_USER_ID',
                        userId: 'SOME_USER_ID',
                        name: 'SOME_NAME',
                        managedBy: 'SOME_OTHER_USER_ID'
                    });
                    done();
                });
            });
        });
    });

    describe('updateUserDeclarations()', () => {
        it('should be able update user declarations providing appropriate http request', (done) => {
            mockHttpService.fetch = jest.fn(() => {
                const response = new CsResponse();
                response.responseCode = 200;
                response.body = {
                    result: {}
                };
                return of(response);
            });

            userService.updateUserDeclarations([
                {
                    operation: UserDeclarationOperation.ADD,
                    userId: 'SOME_USER_ID',
                    orgId: 'SOME_ORG_ID',
                    persona: 'SOME_PERSONA',
                    info: {}
                },
                {
                    operation: UserDeclarationOperation.EDIT,
                    userId: 'SOME_USER_ID',
                    orgId: 'SOME_ORG_ID',
                    persona: 'SOME_PERSONA',
                    info: {}
                }
            ]).subscribe(() => {
                expect(mockHttpService.fetch).toHaveBeenCalledWith(expect.objectContaining({
                    type: 'PATCH',
                    path: expect.stringContaining('/declarations'),
                    body: {
                        request: {
                            declarations: expect.arrayContaining([
                                expect.objectContaining({
                                    operation: UserDeclarationOperation.ADD,
                                }),
                                expect.objectContaining({
                                    operation: UserDeclarationOperation.EDIT,
                                })
                            ])
                        }
                    }
                }));
                done();
            });
        });
    });
});
