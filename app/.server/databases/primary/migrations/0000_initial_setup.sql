CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

/**
 * Copyright 2023 Viascom Ltd liab. Co
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 21, alphabet text DEFAULT '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', additionalBytesFactor float DEFAULT 1.6)
	RETURNS text
	LANGUAGE plpgsql
	VOLATILE LEAKPROOF PARALLEL SAFE
	AS $$
DECLARE
	alphabetArray text [];
	alphabetLength int := 64;
	mask int := 63;
	step int := 34;
BEGIN
	IF size IS NULL OR size < 1 THEN
		RAISE EXCEPTION 'The size must be defined and greater than 0!';
	END IF;
	IF alphabet IS NULL OR length(alphabet) = 0 OR length(alphabet) > 255 THEN
		RAISE EXCEPTION 'The alphabet can''t be undefined, zero or bigger than 255 symbols!';
	END IF;
	IF additionalBytesFactor IS NULL OR additionalBytesFactor < 1 THEN
		RAISE EXCEPTION 'The additional bytes factor can''t be less than 1!';
	END IF;
	alphabetArray := regexp_split_to_array(alphabet, '');
	alphabetLength := array_length(alphabetArray, 1);
	mask := (2 << cast(floor(log(alphabetLength - 1) / log(2)) AS int)) - 1;
	step := cast(ceil(additionalBytesFactor * mask * size / alphabetLength) AS int);
	IF step > 1024 THEN
		step := 1024;
	END IF;
	RETURN nanoid_optimized (size,
		alphabet,
		mask,
		step);
END
$$;

CREATE OR REPLACE FUNCTION nanoid_optimized(size int, alphabet text, mask int, step int)
	RETURNS text
	LANGUAGE plpgsql
	VOLATILE LEAKPROOF PARALLEL SAFE
	AS $$
DECLARE
	idBuilder text := '';
	counter int := 0;
	bytes bytea;
	alphabetIndex int;
	alphabetArray text [];
	alphabetLength int := 64;
BEGIN
	alphabetArray := regexp_split_to_array(alphabet, '');
	alphabetLength := array_length(alphabetArray, 1);
	LOOP
		bytes := gen_random_bytes(step);
		FOR counter IN 0..step - 1 LOOP
			alphabetIndex := (get_byte(bytes, counter) & mask) + 1;
			IF alphabetIndex <= alphabetLength THEN
				idBuilder := idBuilder || alphabetArray [alphabetIndex];
				IF length(idBuilder) = size THEN
					RETURN idBuilder;
				END IF;
			END IF;
		END LOOP;
	END LOOP;
END
$$;

/**
 * Copyright 2023 Kyle Hubert <kjmph@users.noreply.github.com> (https://github.com/kjmph)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the “Software”), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
CREATE OR REPLACE FUNCTION uuidv7()
	RETURNS uuid
	AS $$
BEGIN
	RETURN encode(set_bit(set_bit(overlay(uuid_send(gen_random_uuid ())
					PLACING substring(int8send(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint)
						FROM 3)
					FROM 1 FOR 6), 52, 1), 53, 1), 'hex')::uuid;
END
$$
LANGUAGE plpgsql
VOLATILE;

CREATE TABLE IF NOT EXISTS "schema_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"created_at" bigint
);

--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "schema_migrations_hash_unique" ON "schema_migrations"
	USING btree ("hash");
