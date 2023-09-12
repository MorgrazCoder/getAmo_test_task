import {
    AmoCrmAuthResponseInterface,
    AmoCrmContactsResponseInterface,
    AmoCrmCustomFieldsResponseInterface,
    AmoCrmLeadsResponseInterface,
} from "@common/interfaces";
import { AuthCodeOptions, RefreshTokenOptions } from "@common/types";
import { HttpService } from "@nestjs/axios";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { catchError, firstValueFrom, map } from "rxjs";

@Injectable()
export class AmoCrmService {
    constructor(
        private readonly httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    public authorize(authCode: string) {
        return this.updateTokens({ code: authCode, grant_type: "authorization_code" });
    }

    public async refreshTokens() {
        const refresh_token = await this.cacheManager.get<string>("refresh_token");
        return this.updateTokens({ refresh_token, grant_type: "refresh_token" });
    }

    public async contacts(email: string, phone: string, name: string) {
        const [contactsByEmail, contactsByPhone] = await Promise.all([
            this.findContactsByQueryField(email),
            this.findContactsByQueryField(phone),
        ]);
        if (
            (Object.keys(contactsByEmail).length || Object.keys(contactsByPhone).length) &&
            (!(Object.keys(contactsByEmail).length && Object.keys(contactsByPhone).length) ||
                contactsByEmail?.id == contactsByPhone?.id)
        ) {
            const candidate = Object.keys(contactsByEmail).length
                ? contactsByEmail
                : contactsByPhone;
            const contact = await this.updateContacts(candidate.id, name, email, phone);
            return this.addApplication(contact._embedded.contacts[0].id);
        }

        if (!Object.keys(contactsByEmail).length && !Object.keys(contactsByPhone).length) {
            const contact = await this.addContacts(name, email, phone);
            return this.addApplication(contact._embedded.contacts[0].id);
        }

        throw new BadRequestException({
            message: "Unable to update entry, email or phone number is already in use",
        });
    }

    public async addContacts(name: string, email: string, phone: string) {
        const { EMAIL_CODE, PHONE_CODE } = await this.getCustomFieldsByCode();
        return await this.createContact(name, email, phone, EMAIL_CODE, PHONE_CODE);
    }

    public async updateContacts(contact_id: number, name: string, email: string, phone: string) {
        const { EMAIL_CODE, PHONE_CODE } = await this.getCustomFieldsByCode();
        return await this.updateContact(contact_id, name, email, phone, EMAIL_CODE, PHONE_CODE);
    }

    public async addApplication(contact_id: number) {
        return this.createApplication(contact_id);
    }

    private async findContactsByQueryField(queryField: string) {
        const access_token = await this.cacheManager.get<string>("access_token");

        const headers = {
            Authorization: `Bearer ${access_token}`,
        };

        const url = new URL("/api/v4/contacts", process.env.AMO_CRM_HOST);
        url.searchParams.set(`query`, queryField);

        return await firstValueFrom(
            this.httpService
                .get<AmoCrmContactsResponseInterface>(url.href, {
                    headers,
                })
                .pipe(
                    map((res) => {
                        if (res && res?.data) {
                            const data = res.data._embedded.contacts[0];
                            return {
                                id: data.id,
                                name: data.name,
                                email: data.custom_fields_values[0].values[0].value,
                                phone: data.custom_fields_values[1].values[0].value,
                            };
                        }
                        return {};
                    })
                    // catchError(async (e) => {
                    //     if (e.response?.data?.status == 401) {
                    //         const refresh_token =
                    //             await this.cacheManager.get<string>("refresh_token");
                    //         this.updateTokens({ refresh_token, grant_type: "refresh_token" });
                    //         this.findByQueryField(queryField);
                    //     }
                    // })
                )
            // { defaultValue: {} }
        );
    }

    private async createContact(
        name: string,
        email: string,
        phone: string,
        email_field_id: number,
        phone_field_id: number
    ) {
        const access_token = await this.cacheManager.get<string>("access_token");

        const headers = {
            Authorization: `Bearer ${access_token}`,
        };

        const body = [
            {
                name,
                custom_fields_values: [
                    {
                        field_id: email_field_id,
                        values: [{ value: email }],
                    },
                    {
                        field_id: phone_field_id,
                        values: [{ value: phone }],
                    },
                ],
            },
        ];

        const url = new URL("/api/v4/contacts", process.env.AMO_CRM_HOST);

        return await firstValueFrom(
            this.httpService
                .post<AmoCrmContactsResponseInterface>(url.href, body, {
                    headers,
                })
                .pipe(map((res) => res.data))
        );
    }

    private async updateContact(
        contact_id: number,
        name: string,
        email: string,
        phone: string,
        email_field_id: number,
        phone_field_id: number
    ) {
        const access_token = await this.cacheManager.get<string>("access_token");
        const headers = {
            Authorization: `Bearer ${access_token}`,
        };

        const body = [
            {
                id: contact_id,
                name,
                custom_fields_values: [
                    {
                        field_id: email_field_id,
                        values: [{ value: email }],
                    },
                    {
                        field_id: phone_field_id,
                        values: [{ value: phone }],
                    },
                ],
            },
        ];

        const url = new URL("/api/v4/contacts", process.env.AMO_CRM_HOST);

        return await firstValueFrom(
            this.httpService
                .patch<AmoCrmContactsResponseInterface>(url.href, body, {
                    headers,
                })
                .pipe(map((res) => res.data))
        );
    }

    private async createApplication(contact_id: number) {
        const access_token = await this.cacheManager.get<string>("access_token");

        const headers = {
            Authorization: `Bearer ${access_token}`,
        };

        const body = [
            {
                name: "Тестовая сделка",
                created_by: 0,
                price: 999,
                _embedded: {
                    contacts: [
                        {
                            id: contact_id,
                        },
                    ],
                },
            },
        ];

        const url = new URL("/api/v4/leads", process.env.AMO_CRM_HOST);

        return await firstValueFrom(
            this.httpService
                .post<AmoCrmLeadsResponseInterface>(url.href, body, {
                    headers,
                })
                .pipe(
                    map((res) => res.data),
                    catchError(async (e) => console.log(e))
                )
        );
    }

    private async getCustomFieldsByCode() {
        const access_token = await this.cacheManager.get<string>("access_token");

        const headers = {
            Authorization: `Bearer ${access_token}`,
        };

        const url = new URL("/api/v4/contacts/custom_fields", process.env.AMO_CRM_HOST);

        return await firstValueFrom(
            this.httpService
                .get<AmoCrmCustomFieldsResponseInterface>(url.href, {
                    headers,
                })
                .pipe(
                    map((res) => {
                        const fieldsArray = res.data._embedded.custom_fields.map(
                            (field: { code: string; id: number }) => [
                                `${field.code}_CODE`,
                                field.id,
                            ]
                        );
                        return Object.fromEntries(fieldsArray);
                    })
                )
        );
    }

    private async updateTokens(options: AuthCodeOptions | RefreshTokenOptions) {
        const body = {
            client_id: process.env.AMO_CRM_INTEGRATION_ID,
            client_secret: process.env.AMO_CRM_SECRET_KEY,
            redirect_uri: "http://localhost",
        };

        return await firstValueFrom(
            this.httpService
                .post<AmoCrmAuthResponseInterface>(
                    process.env.AMO_CRM_HOST + "/oauth2/access_token",
                    Object.assign(body, options)
                )
                .pipe(
                    map((res) => res.data),
                    map((data) => this.saveTokens(data)),
                    map(() => void 0),
                    catchError(async (err) => console.log(err))
                )
        );
    }

    private async saveTokens({
        access_token,
        refresh_token,
        expires_in,
    }: AmoCrmAuthResponseInterface) {
        await this.cacheManager.set("access_token", access_token, expires_in);
        await this.cacheManager.set("refresh_token", refresh_token, 0);
    }
}
