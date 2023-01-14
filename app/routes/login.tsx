import { ActionArgs, redirect, Response, Headers } from "@remix-run/node";
import axios from "axios";

export async function action({ request }: ActionArgs) {
    const body = await request.formData();
    let email = body.get("username");
    let password = body.get("password");

    let response = await axios.post("http://localhost:3000/api/auth/signin", {
        formFields: [{
            id: "email",
            value: email
        }, {
            id: "password",
            value: password
        }]
    }, {
        headers: {
            "content-type": "application/json"
        }
    });

    let data = response.data;

    if (data.status === "WRONG_CREDENTIALS_ERROR") {
        return redirect(`/auth/wrong-credentials`);
    }

    // login successful.
    const headers = new Headers();
    headers.append("location", "/");
    response.headers["set-cookie"].forEach((element: any) => {
        headers.append("set-cookie", element)
    });
    return new Response(null, {
        status: 302,
        headers
    });
}